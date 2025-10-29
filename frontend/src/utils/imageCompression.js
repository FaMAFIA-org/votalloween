/**
 * Compresses an image file by resizing and converting to WebP format
 * WebP provides better compression than JPEG/PNG (25-35% smaller) while maintaining quality
 * @param {File} file - The image file to compress
 * @param {number} maxWidth - Maximum width in pixels (default: 1200)
 * @param {number} maxHeight - Maximum height in pixels (default: 1200)
 * @param {number} quality - WebP quality 0-1 (default: 0.85)
 * @returns {Promise<File>} - Compressed WebP image file
 */
export async function compressImage(file, maxWidth = 1200, maxHeight = 1200, quality = 0.85) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      const img = new Image();

      img.onload = () => {
        // Calculate new dimensions while maintaining aspect ratio
        let width = img.width;
        let height = img.height;

        if (width > maxWidth || height > maxHeight) {
          const aspectRatio = width / height;

          if (width > height) {
            width = maxWidth;
            height = width / aspectRatio;
          } else {
            height = maxHeight;
            width = height * aspectRatio;
          }
        }

        // Create canvas and resize image
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);

        // Convert to WebP blob
        canvas.toBlob(
          (blob) => {
            if (!blob) {
              reject(new Error('Failed to compress image'));
              return;
            }

            // Change file extension to .webp
            const originalName = file.name;
            const nameWithoutExt = originalName.substring(0, originalName.lastIndexOf('.')) || originalName;
            const webpName = `${nameWithoutExt}.webp`;

            // Create new File from blob
            const compressedFile = new File([blob], webpName, {
              type: 'image/webp',
              lastModified: Date.now(),
            });

            console.log(`Image compressed to WebP: ${(file.size / 1024).toFixed(2)}KB → ${(compressedFile.size / 1024).toFixed(2)}KB (${((1 - compressedFile.size / file.size) * 100).toFixed(1)}% reduction)`);
            resolve(compressedFile);
          },
          'image/webp',
          quality
        );
      };

      img.onerror = () => {
        reject(new Error('Failed to load image'));
      };

      img.src = e.target.result;
    };

    reader.onerror = () => {
      reject(new Error('Failed to read file'));
    };

    reader.readAsDataURL(file);
  });
}
