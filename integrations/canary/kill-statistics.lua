-- Install in data/scripts/slender/ after applying the website migrations.
-- Reloading preserves pending counters while refreshing named event callbacks.
if type(registerMonsterType) ~= "table" then
	logger.error("[Slender] Kill statistics requires the monster registration library")
	return
end

local state = SlenderKillStatistics or { pending = {}, size = 0, started = os.time(), dropped = 0 }
SlenderKillStatistics = state
local deathName = "SlenderKillStatisticsDeath"
local maxPending = 50000

local function playerOwner(creature)
	if not creature then
		return nil
	end
	if creature:isPlayer() then
		return creature
	end
	local master = creature:getMaster()
	return master and master:isPlayer() and master or nil
end

local function record(race, column)
	if #race == 0 or #race > 255 then
		state.dropped = state.dropped + 1
		return
	end
	local minute = math.floor(os.time() / 60)
	local key = tostring(minute) .. ":" .. race:lower()
	local row = state.pending[key]
	if not row then
		if state.size >= maxPending then
			state.dropped = state.dropped + 1
			return
		end
		row = { minute = minute, race = race, players = 0, monsters = 0 }
		state.pending[key] = row
		state.size = state.size + 1
	end
	row[column] = row[column] + 1
end

local death = CreatureEvent(deathName)
function death.onDeath(creature, corpse, lastHit, mostDamage)
	if creature:isPlayer() then
		if creature:getGroup():getAccess() then
			return true
		end
		local race = "(elemental forces)"
		if playerOwner(lastHit) then
			race = "players"
		elseif lastHit and lastHit:isMonster() then
			race = lastHit:getName()
		end
		record(race, "players")
	elseif creature:isMonster() and not creature:getMaster() then
		local owner = playerOwner(mostDamage) or playerOwner(lastHit)
		if owner and not owner:getGroup():getAccess() then
			record(creature:getName(), "monsters")
		end
	end
	return true
end
death:register()

-- The shared parser runs for every monster definition before initial spawns.
registerMonsterType.slenderKillStatistics = function(monsterType)
	monsterType:registerEvent(deathName)
end

local login = CreatureEvent("SlenderKillStatisticsLogin")
function login.onLogin(player)
	player:registerEvent(deathName)
	return true
end
login:register()

local function flush()
	local now = os.time()
	if not state.id then
		local resultId = db.storeQuery("SELECT UUID() AS id")
		if not resultId then
			return false
		end
		state.id = Result.getString(resultId, "id")
		Result.free(resultId)
	end
	local id = db.escapeString(state.id)
	if not db.query(string.format(
		"INSERT IGNORE INTO slender_kill_collectors (id, started_at, updated_at) VALUES (%s, %d, %d)",
		id, state.started, state.started
	)) then
		return false
	end
	local values = {}
	local function writeBatch()
		if #values == 0 then
			return true
		end
		-- Absolute per-process counters make an uncertain/retried write idempotent.
		local ok = db.query("INSERT INTO slender_kill_statistics (collector_id, minute, race, players_killed, killed_by_players) VALUES "
			.. table.concat(values, ",")
			.. " ON DUPLICATE KEY UPDATE players_killed=VALUES(players_killed), killed_by_players=VALUES(killed_by_players)")
		values = {}
		return ok
	end
	for _, row in pairs(state.pending) do
		values[#values + 1] = string.format("(%s,%d,%s,%d,%d)", id, row.minute, db.escapeString(row.race), row.players, row.monsters)
		if #values == 100 and not writeBatch() then
			return false
		end
	end
	if not writeBatch() or not db.query(string.format(
		"UPDATE slender_kill_collectors SET updated_at=%d, dropped_events=%d WHERE id=%s", now, state.dropped, id
	)) then
		return false
	end
	for key, row in pairs(state.pending) do
		if row.minute < math.floor(now / 60) then
			state.pending[key] = nil
			state.size = state.size - 1
		end
	end
	if not state.cleaned or now - state.cleaned >= 3600 then
		local cutoff = math.floor(now / 60) - 8 * 1440
		db.query("DELETE FROM slender_kill_statistics WHERE minute < " .. cutoff)
		db.query("DELETE FROM slender_kill_collectors WHERE updated_at < " .. (cutoff * 60))
		state.cleaned = now
	end
	return true
end

local startup = GlobalEvent("SlenderKillStatisticsStart")
function startup.onStartup()
	if not flush() then
		logger.warn("[Slender] Kill statistics database unavailable; buffered writes will retry")
	end
	return true
end
startup:register()

local timer = GlobalEvent("SlenderKillStatisticsFlush")
function timer.onThink()
	if not flush() then
		logger.warn("[Slender] Kill statistics flush failed; pending counters retained")
	end
	return true
end
timer:interval(30000)
timer:register()

local shutdown = GlobalEvent("SlenderKillStatisticsStop")
function shutdown.onShutdown()
	if not flush() then
		logger.error("[Slender] Kill statistics could not persist pending counters on shutdown")
	end
	return true
end
shutdown:register()
