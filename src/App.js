import React, { useRef } from 'react';
import cv from '@techstark/opencv-js';

const ContourFinder = () => {
  const inputRef = useRef(null);
  const canvasRef = useRef(null);

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    const img = await loadImage(file);

    if (img) {
      const contours = findContours(img);
      drawImageAndContours(img, contours);
    }
  };

  const loadImage = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => resolve(img);
        img.src = e.target.result;
      };
      reader.readAsDataURL(file);
    });
  };

  const findContours = (img) => {
    // Convert image to Mat (assuming cv.imread() provided by the library)
    const src = cv.imread(img);

    // Convert to grayscale
    const gray = new cv.Mat();
    cv.cvtColor(src, gray, cv.COLOR_RGBA2GRAY);

    // Find contours
    const contours = new cv.MatVector();
    const hierarchy = new cv.Mat();
    cv.findContours(gray, contours, hierarchy, cv.RETR_EXTERNAL, cv.CHAIN_APPROX_SIMPLE);

    // Cleanup
    src.delete();
    gray.delete();
    hierarchy.delete();

    return contours;
  };

  const drawImageAndContours = (img, contours) => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw original image on canvas
    canvas.width = img.width;
    canvas.height = img.height;
    ctx.drawImage(img, 0, 0);

    // Draw contours
    ctx.strokeStyle = 'blue';
    ctx.lineWidth = 2;
    for (let i = 0; i < contours.size(); ++i) {
      const contour = contours.get(i);
      ctx.beginPath();
      ctx.moveTo(contour.data32S[0], contour.data32S[1]);
      for (let j = 1; j < contour.rows; ++j) {
        const point = new cv.Point(contour.data32S[j * contour.cols], contour.data32S[j * contour.cols + 1]);
        ctx.lineTo(point.x, point.y);
      }
      ctx.closePath();
      ctx.stroke();
      contour.delete();
    }
  };

  return (
    <div>
      <input type="file" accept="image/*" onChange={handleImageUpload} />
      <canvas ref={canvasRef}></canvas>
    </div>
  );
};

export default ContourFinder;
