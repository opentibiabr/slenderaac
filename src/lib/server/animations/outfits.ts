import {
	Canvas,
	CanvasRenderingContext2D,
	createCanvas,
	loadImage,
} from 'canvas';
import path from 'path';

import { outfitColors } from '$lib/server/animations/config';
import {
	normalizedImagePath,
	type OutfitData,
} from '$lib/server/animations/metadata';

function fileExists(filePath: string, outfitData: OutfitData): boolean {
	return outfitData.files.includes(normalizedImagePath(filePath));
}

export async function outfit(
	outfitData: OutfitData,
	outfitPath: string,
	outfit: number,
	addons: number,
	head: number,
	body: number,
	legs: number,
	feet: number,
	mount: number,
	direction = 3,
	animation = 1,
	resizeTo64px = false,
): Promise<CanvasRenderingContext2D | null> {
	const outfitFrame = ((animation - 1) % outfitData.framesNumber) + 1;
	let mountId: number;
	let mountState: number;

	if (mount == 0) {
		mountId = 0;
		mountState = 1;
	} else {
		mountId = mount;
		mountState = 2;
	}

	const outfitImagePath = path.join(
		outfitPath,
		outfit.toString(),
		`${outfitFrame}_${mountState}_1_${direction}.png`,
	);
	if (!fileExists(outfitImagePath, outfitData)) {
		console.warn('Outfit not found', outfit, addons, head, body, legs, feet);
		return null;
	}

	const imageOutfit = await loadImage(outfitImagePath);

	const width = imageOutfit.width;
	const height = imageOutfit.height;

	let templateCanvas: Canvas | null = null;
	let templateCtx: CanvasRenderingContext2D | null = null;

	let outfitCanvas = createCanvas(width, height);
	const outfitCtx = outfitCanvas.getContext('2d');

	const outfitTemplateImagePath = path.join(
		outfitPath,
		outfit.toString(),
		`${outfitFrame}_${mountState}_1_${direction}_template.png`,
	);
	outfitCtx.drawImage(imageOutfit, 0, 0);

	if (fileExists(outfitTemplateImagePath, outfitData)) {
		templateCanvas = createCanvas(width, height);
		templateCtx = templateCanvas.getContext('2d');
		templateCtx.drawImage(await loadImage(outfitTemplateImagePath), 0, 0);
	}

	if (addons == 1 || addons == 3) {
		const imageFirstPath = path.join(
			outfitPath,
			outfit.toString(),
			`${outfitFrame}_${mountState}_2_${direction}.png`,
		);
		if (fileExists(imageFirstPath, outfitData)) {
			const imageFirst = await loadImage(imageFirstPath);
			outfitCtx.drawImage(imageFirst, 0, 0);

			const imageFirstTemplatePath = path.join(
				outfitPath,
				outfit.toString(),
				`${outfitFrame}_${mountState}_2_${direction}_template.png`,
			);
			if (templateCtx && fileExists(imageFirstTemplatePath, outfitData)) {
				const imageFirstTemplate = await loadImage(imageFirstTemplatePath);
				templateCtx.drawImage(imageFirstTemplate, 0, 0);
			}
		}
	}

	if (addons == 2 || addons == 3) {
		const imageSecondPath = path.join(
			outfitPath,
			String(outfit),
			`${outfitFrame}_${mountState}_3_${direction}.png`,
		);
		if (fileExists(imageSecondPath, outfitData)) {
			const imageSecond = await loadImage(imageSecondPath);
			outfitCtx.drawImage(imageSecond, 0, 0);

			const imageSecondTemplatePath = path.join(
				outfitPath,
				outfit.toString(),
				`${outfitFrame}_${mountState}_3_${direction}_template.png`,
			);
			if (templateCtx && fileExists(imageSecondTemplatePath, outfitData)) {
				const imageSecondTemplate = await loadImage(imageSecondTemplatePath);
				templateCtx.drawImage(imageSecondTemplate, 0, 0);
			}
		}
	}

	templateCanvas &&
		colorize(templateCanvas, outfitCanvas, head, body, legs, feet);

	const mountAnimationFrame =
		((animation - 1) % outfitData.mountFramesNumber) + 1;

	if (mountState == 2) {
		const mountImagePath = path.join(
			outfitPath,
			String(mountId),
			`${mountAnimationFrame}_1_1_${direction}.png`,
		);
		if (fileExists(mountImagePath, outfitData)) {
			const mountImage = await loadImage(mountImagePath);
			const mountCanvas = createCanvas(width, height);
			const mountCtx = mountCanvas.getContext('2d');
			mountCtx.clearRect(0, 0, width, height);
			mountCtx.drawImage(mountImage, 0, 0);
			mountCtx.drawImage(outfitCanvas, 0, 0);
			outfitCanvas = mountCanvas;
		}
	}

	const imageOutfitTCanvas = createCanvas(
		resizeTo64px ? 64 : width,
		resizeTo64px ? 64 : height,
	);
	const imageOutfitTContext = imageOutfitTCanvas.getContext('2d');
	imageOutfitTContext.clearRect(0, 0, width, height);
	imageOutfitTContext.globalCompositeOperation = 'destination-in';
	imageOutfitTContext.drawImage(
		outfitCanvas,
		imageOutfitTCanvas.width - width,
		imageOutfitTCanvas.height - height,
	);
	imageOutfitTContext.globalCompositeOperation = 'source-over';
	imageOutfitTContext.globalAlpha = 1;
	imageOutfitTContext.drawImage(
		outfitCanvas,
		imageOutfitTCanvas.width - width,
		imageOutfitTCanvas.height - height,
	);
	return imageOutfitTContext;
}

function colorizePixel(color: number, r: number, g: number, b: number) {
	let value: number;
	if (color < outfitColors.length) value = outfitColors[color];
	else value = 0;
	const ro = (value & 0xff0000) >> 16; // rgb outfit
	const go = (value & 0xff00) >> 8;
	const bo = value & 0xff;
	r = Math.floor(r * (ro / 255));
	g = Math.floor(g * (go / 255));
	b = Math.floor(b * (bo / 255));
	return { r, g, b };
}

function colorize(
	templateCanvas: Canvas,
	outfitCanvas: Canvas,
	head: number,
	body: number,
	legs: number,
	feet: number,
) {
	const templateContext = templateCanvas.getContext('2d');
	const templateImageData = templateContext.getImageData(
		0,
		0,
		templateCanvas.width,
		templateCanvas.height,
	);
	const templatePixels = templateImageData.data;

	const outfitContext = outfitCanvas.getContext('2d');
	const outfitImageData = outfitContext.getImageData(
		0,
		0,
		outfitCanvas.width,
		outfitCanvas.height,
	);
	const outfitPixels = outfitImageData.data;

	for (let i = 0; i < templatePixels.length; i += 4) {
		const templatePixel =
			(templatePixels[i] << 16) |
			(templatePixels[i + 1] << 8) |
			templatePixels[i + 2];
		const outfitPixel =
			(outfitPixels[i] << 16) |
			(outfitPixels[i + 1] << 8) |
			outfitPixels[i + 2];

		if (templatePixel === outfitPixel) continue;

		const rt = (templatePixel >> 16) & 0xff;
		const gt = (templatePixel >> 8) & 0xff;
		const bt = templatePixel & 0xff;
		let ro = (outfitPixel >> 16) & 0xff;
		let go = (outfitPixel >> 8) & 0xff;
		let bo = outfitPixel & 0xff;

		if (rt && gt && !bt) {
			// yellow == head
			const { r, g, b } = colorizePixel(head, ro, go, bo);
			ro = r;
			go = g;
			bo = b;
		} else if (rt && !gt && !bt) {
			// red == body
			const { r, g, b } = colorizePixel(body, ro, go, bo);
			ro = r;
			go = g;
			bo = b;
		} else if (!rt && gt && !bt) {
			// green == legs
			const { r, g, b } = colorizePixel(legs, ro, go, bo);
			ro = r;
			go = g;
			bo = b;
		} else if (!rt && !gt && bt) {
			// blue == feet
			const { r, g, b } = colorizePixel(feet, ro, go, bo);
			ro = r;
			go = g;
			bo = b;
		} else {
			continue; // if nothing changed, skip the change of pixel
		}

		outfitPixels[i] = ro;
		outfitPixels[i + 1] = go;
		outfitPixels[i + 2] = bo;
	}

	outfitContext.putImageData(outfitImageData, 0, 0);
}
