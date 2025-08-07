import { useState, useRef } from 'react';
import { Upload, File, X, AlertCircle, CheckCircle } from 'lucide-react';
import { ticketsAPI } from '../services/api';
import './AttachmentUpload.css';

const AttachmentUpload = ({ 
  ticketId, 
  attachments = {}, 
  onUploadSuccess, 
  onDeleteSuccess,
  disabled = false 
}) => {
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [message, setMessage] = useState(null);
  const fileInputRef = useRef(null);

  // Tipos de anexo permitidos
  const attachmentTypes = [
    { value: 'cupom-venda', label: 'Cupom da Venda' },
    { value: 'contrato', label: 'Contrato' },
    { value: 'outros', label: 'Outros Anexos' }
  ];

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      handleUpload(file, 'cupom-venda'); // Default para cupom da venda
    }
  };

  const handleUpload = async (file, attachmentType) => {
    if (!file) return;

    // Validar tipo de arquivo
    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'];
    if (!allowedTypes.includes(file.type)) {
      setMessage({
        type: 'error',
        text: 'Tipo de arquivo não permitido. Use apenas PDF, JPEG ou PNG.'
      });
      return;
    }

    // Validar tamanho (10MB)
    if (file.size > 10 * 1024 * 1024) {
      setMessage({
        type: 'error',
        text: 'Arquivo muito grande. Tamanho máximo: 10MB.'
      });
      return;
    }

    setUploading(true);
    setUploadProgress(0);
    setMessage(null);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('attachmentType', attachmentType);

      const response = await ticketsAPI.uploadAttachment(ticketId, formData);
      const result = response.data;
      
      setMessage({
        type: 'success',
        text: 'Arquivo anexado com sucesso!'
      });

      // Limpar input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }

      // Callback para atualizar lista de anexos
      if (onUploadSuccess) {
        onUploadSuccess(result.attachment);
      }

      // Limpar mensagem após 3 segundos
      setTimeout(() => setMessage(null), 3000);

    } catch (error) {
      console.error('Erro no upload:', error);
      setMessage({
        type: 'error',
        text: error.message
      });
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  const handleDelete = async (attachmentId) => {
    if (!confirm('Tem certeza que deseja remover este anexo?')) return;

    try {
      await ticketsAPI.deleteAttachment(ticketId, attachmentId);

      setMessage({
        type: 'success',
        text: 'Anexo removido com sucesso!'
      });

      // Callback para atualizar lista
      if (onDeleteSuccess) {
        onDeleteSuccess(attachmentId);
      }

      setTimeout(() => setMessage(null), 3000);

    } catch (error) {
      console.error('Erro ao deletar:', error);
      setMessage({
        type: 'error',
        text: error.message
      });
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getAttachmentTypeLabel = (type) => {
    const typeObj = attachmentTypes.find(t => t.value === type);
    return typeObj ? typeObj.label : type;
  };

  return (
    <div className="attachment-upload">
      <div className="upload-header">
        <h4>Anexos do Checklist</h4>
        {!disabled && (
          <label className={`upload-button ${uploading ? 'disabled' : ''}`}>
            <Upload size={16} />
            {uploading ? 'Enviando...' : 'Adicionar Anexo'}
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.jpg,.jpeg,.png"
              onChange={handleFileSelect}
              disabled={uploading || disabled}
              style={{ display: 'none' }}
            />
          </label>
        )}
      </div>

      {message && (
        <div className={`upload-message ${message.type}`}>
          {message.type === 'success' ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
          <span>{message.text}</span>
          <button onClick={() => setMessage(null)} className="message-close">×</button>
        </div>
      )}

      {uploading && (
        <div className="upload-progress">
          <div className="progress-bar">
            <div 
              className="progress-fill" 
              style={{ width: `${uploadProgress}%` }}
            />
          </div>
          <span>Enviando arquivo...</span>
        </div>
      )}

      <div className="attachments-list">
        {Object.keys(attachments).length === 0 ? (
          <p className="no-attachments">Nenhum anexo adicionado</p>
        ) : (
          Object.entries(attachments).map(([id, attachment]) => (
            <div key={id} className="attachment-item">
              <div className="attachment-icon">
                <File size={20} />
              </div>
              <div className="attachment-info">
                <div className="attachment-name">
                  <a 
                    href="#" 
                    onClick={async (e) => {
                      e.preventDefault();
                      
                      try {
                        const response = await ticketsAPI.getDownloadUrl(ticketId, id);
                        const { downloadUrl } = response.data;
                        window.open(downloadUrl, '_blank');
                      } catch (error) {
                        console.error('Erro ao obter URL de download:', error);
                        alert('Erro ao abrir anexo. Tente novamente.');
                      }
                    }}
                    title="Abrir arquivo"
                    style={{ cursor: 'pointer' }}
                  >
                    {attachment.fileName}
                  </a>
                </div>
                <div className="attachment-meta">
                  <span className="attachment-type">
                    {getAttachmentTypeLabel(attachment.attachmentType)}
                  </span>
                  <span className="attachment-size">
                    {formatFileSize(attachment.fileSize)}
                  </span>
                  <span className="attachment-date">
                    {new Date(attachment.uploadedAt).toLocaleDateString('pt-BR')}
                  </span>
                </div>
              </div>
              {!disabled && (
                <button
                  className="delete-attachment"
                  onClick={() => handleDelete(id)}
                  title="Remover anexo"
                >
                  <X size={16} />
                </button>
              )}
            </div>
          ))
        )}
      </div>

      <div className="upload-hints">
        <p><strong>Tipos permitidos:</strong> PDF, JPEG, PNG (máx. 10MB)</p>
        <p><strong>Anexos sugeridos:</strong> Cupom da venda, Contratos, Documentos complementares</p>
      </div>
    </div>
  );
};

export default AttachmentUpload;