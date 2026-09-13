local now = 2000000040
local events, queries = {}, {}
local failUpdate = false
os.time = function() return now end
registerMonsterType = {}
local function event(name)
	local value = { name = name }
	function value:register() events[self.name] = self end
	function value:interval(ms) assert(ms == 30000) end
	return value
end
CreatureEvent, GlobalEvent = event, event
logger = { error = function() end, warn = function() end }
db = {
	escapeString = function(value) return "'" .. value:gsub("'", "''") .. "'" end,
	storeQuery = function() return 1 end,
	query = function(query)
		queries[#queries + 1] = query
		if failUpdate and query:match("^UPDATE slender_kill_collectors") then
			return false
		end
		return true
	end,
}
Result = { getString = function() return "00000000-0000-4000-a000-000000000001" end, free = function() end }

assert(loadfile("integrations/canary/kill-statistics.lua"))()
local state = SlenderKillStatistics
local registered = {}
registerMonsterType.slenderKillStatistics({ registerEvent = function(_, name) registered[#registered + 1] = name end })
assert(registered[1] == "SlenderKillStatisticsDeath")

local function creature(name, player, master, staff)
	return {
		getName = function() return name end,
		isPlayer = function() return player end,
		isMonster = function() return not player end,
		getMaster = function() return master end,
		getGroup = function() return { getAccess = function() return staff or false end } end,
		registerEvent = function(_, name) registered[#registered + 1] = name end,
	}
end
local player = creature("Private Character", true)
local monster = creature("dragon", false)
local summon = creature("summon", false, player)
local staff = creature("Private Staff", true, nil, true)
local death = events.SlenderKillStatisticsDeath.onDeath
assert(events.SlenderKillStatisticsLogin.onLogin(player))
assert(registered[2] == "SlenderKillStatisticsDeath")
assert(events.SlenderKillStatisticsStart.onStartup())
assert(death(monster, nil, player, player))
assert(death(monster, nil, summon, summon))
assert(death(monster, nil, monster, nil)) -- no player credit
assert(death(summon, nil, player, player)) -- summoned victim
assert(death(monster, nil, staff, staff))
assert(death(staff, nil, monster, monster))
assert(death(player, nil, monster, monster))
assert(death(player, nil, summon, summon))
assert(death(player, nil, nil, nil))
local key = tostring(math.floor(now / 60)) .. ":dragon"
assert(state.pending[key].monsters == 2 and state.pending[key].players == 1)
assert(state.size == 3)
assert(events.SlenderKillStatisticsFlush.onThink())
assert(state.size == 3) -- retain current minute's absolute counts
local joined = table.concat(queries, "\n")
assert(not joined:find("Private Character", 1, true))
assert(not joined:find("Private Staff", 1, true))
assert(joined:find("players_killed=VALUES(players_killed)", 1, true))
now = now + 60
failUpdate = true
assert(events.SlenderKillStatisticsFlush.onThink())
assert(state.size == 3) -- heartbeat failure must not discard pending counters
failUpdate = false
assert(events.SlenderKillStatisticsFlush.onThink())
assert(state.size == 0)

local count = 0
for _ in pairs(events) do count = count + 1 end
local previousDeath = events.SlenderKillStatisticsDeath
registerMonsterType = {} -- the core registration library can reload first
assert(loadfile("integrations/canary/kill-statistics.lua"))()
local after = 0
for _ in pairs(events) do after = after + 1 end
assert(after == count and SlenderKillStatistics == state)
assert(events.SlenderKillStatisticsDeath ~= previousDeath)
assert(type(registerMonsterType.slenderKillStatistics) == "function")
state.size = 50000
death(monster, nil, player, player)
assert(state.dropped == 1 and next(state.pending) == nil)
state.size = 0
assert(events.SlenderKillStatisticsStop.onShutdown())
print("Passed: registration, attribution, summons, staff, privacy, idempotent writes, retry, minute rotation, reload and bounded buffering")
