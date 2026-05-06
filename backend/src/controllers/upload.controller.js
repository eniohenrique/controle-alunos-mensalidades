function uploadComprovante(req, res) {
  try {
    if (!req.file) {
      return res.status(400).json({
        message: "Nenhum arquivo enviado.",
      });
    }

    const fileUrl = `/uploads/${req.file.filename}`;

    return res.status(201).json({
      message: "Comprovante enviado com sucesso.",
      url: fileUrl,
      arquivo: req.file.filename,
    });
  } catch (error) {
    console.error("Erro ao fazer upload do comprovante:", error);

    return res.status(500).json({
      message: "Erro ao fazer upload do comprovante.",
    });
  }
}

module.exports = {
  uploadComprovante,
};
