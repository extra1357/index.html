/**
 * Comprime uma imagem no navegador do cliente antes de enviar para o servidor.
 * @param file O arquivo de imagem vindo do <input type="file">
 * @param maxWidth Largura máxima da imagem (padrão 1280px para boa qualidade web)
 * @param quality Qualidade de saída de 0 a 1 (padrão 0.7 ou 70%)
 */
export const compressImage = (file: File, maxWidth = 1280, quality = 0.7): Promise<File> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);

    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;

      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        // Redimensiona proporcionalmente se a imagem for maior que o maxWidth
        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) return reject(new Error('Não foi possível obter o contexto do Canvas'));

        ctx.drawImage(img, 0, 0, width, height);

        canvas.toBlob(
          (blob) => {
            if (!blob) return reject(new Error('Falha na conversão para Blob'));
            
            const compressedFile = new File([blob], file.name, {
              type: 'image/jpeg',
              lastModified: Date.now(),
            });
            resolve(compressedFile);
          },
          'image/jpeg',
          quality
        );
      };
    };

    reader.onerror = (error) => reject(error);
  });
};
