const video = document.getElementById('video');

Promise.all([
	faceapi.nets.tinyFaceDetector.loadFromUri('./models'),
	faceapi.nets.faceLandmark68Net.loadFromUri('./models'),
	faceapi.nets.faceRecognitionNet.loadFromUri('./models'),
]).then(startVideo)

function startVideo() {
	navigator.getUserMedia(
		{ video: {} },
		stream => video.srcObject = stream,
		err => console.error(err)
	)
}

let resized_w = 640;
let fps = 12;
let avg = 0;
let offset = (video.height * .33) / 2;

video.addEventListener('play', () => {
	const canvas = faceapi.createCanvasFromMedia(video);
	document.body.querySelector('.webcam-container').append(canvas);
	let ratio_w = resized_w / video.width;
	const displaySize = { width: video.width * ratio_w, height: video.height * ratio_w };
	video.width = video.width * ratio_w;
	video.height = video.height * ratio_w;
	faceapi.matchDimensions(canvas, displaySize);
	var ctx = canvas.getContext('2d');
	let padding = 1.4;
	let scores = [];
	ctx.lineCap = "round"

	setInterval(async () => {
		const detections = await faceapi.detectAllFaces(video, new faceapi.TinyFaceDetectorOptions()).withFaceLandmarks();
		const resizedDetections = faceapi.resizeResults(detections, displaySize);
		ctx.clearRect(0, 0, canvas.width, canvas.height);
		if (resizedDetections[0] && resizedDetections[0].alignedRect) {
			let bbox = resizedDetections[0].alignedRect._box;

			ctx.beginPath();
			ctx.lineWidth = 8;
			ctx.setLineDash([]);
			ctx.arc((bbox._x + (bbox._width / 2)), bbox._y + (bbox._height / 2), (bbox._width / 2) * padding, 0, 2 * Math.PI);
			avg = scores.reduce((a, b) => a + b, 0) / scores.length;
			if (avg >= .9 && checkBoundaries(bbox)) {
				ctx.strokeStyle = `rgba(46, 204, 113, .8)`;
			}
			else {
				ctx.strokeStyle = `rgba(231, 76, 60, .8)`;
			}
			ctx.stroke();

			scores.push(resizedDetections[0].detection._score);
			if (scores.length >= fps) { scores.shift(); }

			console.log(avg, checkBoundaries(bbox));
		}

		ctx.beginPath();
		ctx.lineWidth = 4;
		ctx.setLineDash([8, 12]);
		ctx.strokeStyle = `rgba(46, 204, 113, .8)`;
		ctx.rect(offset, offset, canvas.width - (offset * 2), canvas.height - (offset * 2));
		ctx.stroke();
	}, 1e3 / fps);
});

function checkBoundaries(bbox) {
	if (bbox._x >= offset && bbox._x + bbox._width <= video.width - offset) {
		if (bbox._y >= offset && bbox._y + bbox._height <= video.height - offset) {
			return true;
		}
		else {
			return false;
		}
	}
	else {
		return false;
	}
}

function crop() {
	if (avg >= .9 && checkBoundaries(bbox)) {
		let canvas_copy = document.createElement('canvas');
	}
}

let color_low = [46, 204, 113];
let color_high = [231, 76, 60];
function easeColors(score) {
	let mix_r = Math.round(lerp(color_high[0], color_low[0], score));
	let mix_g = Math.round(lerp(color_high[1], color_low[1], score));
	let mix_b = Math.round(lerp(color_high[2], color_low[2], score));

	return `rgba(${mix_r},${mix_g},${mix_b},.75)`;
}

function lerp(a, b, u) {
	return (1 - u) * a + u * b;
};