import React, { useState, useEffect, useRef } from 'react';
import MyButton from './MyButton';
import { Modal, InputNumber, App } from 'antd';
import { 
  FaFileExcel, FaQrcode, FaFilePdf, FaRobot, 
  FaCloudUploadAlt, FaLink, FaTrash 
} from 'react-icons/fa';
import { 
  CloudUploadOutlined, 
  DownloadOutlined 
} from '@ant-design/icons';
import jsQR from 'jsqr';
import { 
  importProductsExcel, importProductsQR, 
  importProductsPDF, importProductsAI 
} from '../api/product';

const ProductImport = ({
  isExcelVisible, onExcelCancel,
  isQRVisible, onQRCancel,
  isPDFVisible, onPDFCancel,
  isAIVisible, onAICancel,
  onSuccess
}) => {
  const { message } = App.useApp();
  const [loading, setLoading] = useState(false);
  const [importAction, setImportAction] = useState('create');
  
  // File states
  const [excelFile, setExcelFile] = useState(null);
  const [pdfFile, setPdfFile] = useState(null);
  const [qrFile, setQrFile] = useState(null);
  const [qrContent, setQrContent] = useState("");
  const [aiQuantity, setAiQuantity] = useState(null);

  // QR Camera states
  const [scanning, setScanning] = useState(false);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const requestRef = useRef(null);

  // Import handlers
  const handleImportExcel = async (actionType) => {
    if (!excelFile) return message.warning("Vui lòng chọn file Excel");
    setLoading(true);
    try {
      await importProductsExcel(excelFile, actionType || importAction);
      message.success("Import Excel thành công");
      onExcelCancel();
      setExcelFile(null);
      if (onSuccess) onSuccess();
    } catch (error) {
      message.error(error.message || "Import Excel thất bại");
    } finally {
      setLoading(false);
    }
  };

  const handleImportAI = async () => {
    if (!aiQuantity) return message.warning("Vui lòng nhập số lượng");
    setLoading(true);
    try {
      await importProductsAI(aiQuantity);
      message.success(`Đã tạo ${aiQuantity} sản phẩm bằng AI`);
      onAICancel();
      setAiQuantity(null);
      if (onSuccess) onSuccess();
    } catch (error) {
      message.error(error.message || "Tạo sản phẩm bằng AI thất bại");
    } finally {
      setLoading(false);
    }
  };

  const handleImportQRData = (data) => {
    setQrContent(typeof data === 'object' ? JSON.stringify(data) : data);
    message.success("Đã nhận dữ liệu QR. Vui lòng chọn Thêm mới hoặc Cập nhật.");
  };

  const handleImportQR = async (actionType) => {
    const source = qrFile ? 'file' : (qrContent ? 'camera' : null);
    const data = qrFile || qrContent;

    if (!data) return message.warning("Vui lòng chọn file QR hoặc quét mã bằng camera");
    
    setLoading(true);
    try {
      await importProductsQR(source, data, actionType || importAction);
      message.success("Import QR thành công");
      onQRCancel();
      setQrFile(null);
      setQrContent("");
      if (onSuccess) onSuccess();
    } catch (error) {
      message.error(error.message || "Import QR thất bại");
    } finally {
      setLoading(false);
    }
  };

  const handleImportPDF = async (actionType) => {
    if (!pdfFile) return message.warning("Vui lòng chọn file PDF");
    setLoading(true);
    try {
      await importProductsPDF(pdfFile, actionType || importAction);
      message.success("Import PDF thành công");
      onPDFCancel();
      setPdfFile(null);
      if (onSuccess) onSuccess();
    } catch (error) {
      message.error(error.message || "Import PDF thất bại");
    } finally {
      setLoading(false);
    }
  };

  // QR Scanning logic
  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
        setScanning(true);
        requestRef.current = requestAnimationFrame(scanQRCode);
      }
    } catch (error) {
      message.error("Không thể mở camera: " + error.message);
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const tracks = videoRef.current.srcObject.getTracks();
      tracks.forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
    setScanning(false);
    if (requestRef.current) {
      cancelAnimationFrame(requestRef.current);
    }
  };

  const scanQRCode = () => {
    if (videoRef.current && canvasRef.current && scanning) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      if (video.readyState === video.HAVE_ENOUGH_DATA) {
        const ctx = canvas.getContext('2d', { willReadFrequently: true });
        canvas.height = video.videoHeight;
        canvas.width = video.videoWidth;
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const code = jsQR(imageData.data, imageData.width, imageData.height, {
          inversionAttempts: "dontInvert",
        });

        if (code) {
          message.success("Đã tìm thấy mã QR!");
          stopCamera();
          try {
            const qrData = JSON.parse(code.data);
            handleImportQRData(qrData);
          } catch (e) {
            handleImportQRData(code.data);
          }
        }
      }
      requestRef.current = requestAnimationFrame(scanQRCode);
    }
  };

  useEffect(() => {
    if (isQRVisible) {
      startCamera();
    } else {
      stopCamera();
    }
    return () => stopCamera();
  }, [isQRVisible]);

  return (
    <>
      <Modal
        title={<div className="modal-title-custom"><FaFileExcel /> Tải lên danh sách sản phẩm từ Excel</div>}
        open={isExcelVisible}
        onCancel={onExcelCancel}
        footer={
          <div className="modal-footer">
            <MyButton className="btn-gray-foot" onClick={onExcelCancel}>Hủy</MyButton>
            <MyButton className="btn-blue-foot" onClick={() => handleImportExcel('update')} disabled={loading}>
              <FaCloudUploadAlt /> Cập nhật
            </MyButton>
            <MyButton className="btn-blue-foot" onClick={() => handleImportExcel('create')} disabled={loading}>
              <FaCloudUploadAlt /> Thêm mới
            </MyButton>
          </div>
        }
        width={600}
        style={{ top: 20, marginBottom: 30 }}
      >
        <div className="import-guide">
            <div className="guide-title">
                <div className="guide-icon">!</div> Lưu ý khi tải lên
            </div>
            <ul>
                <li>File Excel phải đúng định dạng như mẫu</li>
                <li>Mã sản phẩm (code) và tiêu đề (name) không được để trống</li>
                <li>Giá (price) phải lớn hơn 1.000đ</li>
                <li>Nhấn "Thêm mới" để tạo sản phẩm mới hoặc "Cập nhật" để chỉnh sửa sản phẩm hiện có</li>
            </ul>
        </div>
        
        <MyButton className="btn-green-download">
            <DownloadOutlined /> Tải xuống file mẫu Excel
        </MyButton>

        <div className="drop-area" onClick={() => document.getElementById('excel-upload').click()}>
            <input 
                type="file" id="excel-upload" hidden 
                accept=".xlsx, .xls"
                onChange={e => setExcelFile(e.target.files[0])}
            />
            <div className="drop-area-icon"><CloudUploadOutlined /></div>
            <p className="drop-area-text">Kéo thả hoặc nhấn để chọn file Excel</p>
            <p className="drop-area-hint">Chỉ hỗ trợ tải lên file Excel (.xlsx, .xls)</p>
        </div>

        {excelFile && (
            <div className="file-item">
                <div className="file-info">
                    <FaLink /> {excelFile.name}
                </div>
                <div className="delete-file-btn" onClick={(e) => { e.stopPropagation(); setExcelFile(null); }}>
                    <FaTrash />
                </div>
            </div>
        )}
      </Modal>

      <Modal
        title={<div className="modal-title-custom"><FaRobot /> Tạo sản phẩm tự động bằng AI</div>}
        open={isAIVisible}
        onCancel={onAICancel}
        footer={
          <div className="modal-footer">
            <MyButton className="btn-gray-foot" onClick={onAICancel}>Hủy</MyButton>
            <MyButton className="btn-blue-foot" onClick={handleImportAI} disabled={loading}>
              <FaCloudUploadAlt /> Thêm
            </MyButton>
          </div>
        }
        width={600}
        style={{ top: 20, marginBottom: 30 }}
      >
        <div className="import-guide">
            <div className="guide-title">
                <div className="guide-icon">!</div> Hướng dẫn sử dụng
            </div>
            <ul>
                <li>Nhập số lượng sản phẩm muốn tạo tự động.</li>
                <li>Dữ liệu sẽ được sinh ngẫu nhiên theo định dạng hợp lệ.</li>
                <li>Chỉ hỗ trợ thêm mới sản phẩm.</li>
                <li>Giới hạn tạo 100 sản phẩm.</li>
            </ul>
        </div>
        
        <div className="form-group" style={{marginBottom: 20}}>
            <label style={{fontSize: 18, color: '#334155', fontWeight: 400}}>Số lượng sản phẩm:</label>
            <InputNumber 
                min={1} max={100} 
                style={{width: '100%', height: 45, borderRadius: 8, display: 'flex', alignItems: 'center'}} 
                value={aiQuantity}
                onChange={setAiQuantity}
            />
        </div>
      </Modal>

      <Modal
        title={<div className="modal-title-custom"><FaQrcode /> Tải danh sách sản phẩm từ mã QR</div>}
        open={isQRVisible}
        onCancel={onQRCancel}
        footer={
          <div className="modal-footer">
            <MyButton className="btn-gray-foot" onClick={onQRCancel}>Hủy</MyButton>
            <MyButton className="btn-blue-foot" onClick={() => handleImportQR('update')} disabled={loading}>
              <FaCloudUploadAlt /> Cập nhật
            </MyButton>
            <MyButton className="btn-blue-foot" onClick={() => handleImportQR('create')} disabled={loading}>
              <FaCloudUploadAlt /> Thêm mới
            </MyButton>
          </div>
        }
        width={600}
        style={{ top: 20, marginBottom: 30 }}
      >
        <div className="camera-alert-blue">
            Vui lòng quét mã QR bằng camera trước. Nếu không quét được, bạn có thể tải lên hình ảnh mã QR.
        </div>

        <div className="qr-camera-container">
            <div className="camera-label">Quét mã QR bằng Camera</div>
            <div className="camera-preview-wrapper">
                <video ref={videoRef} className="camera-preview" playsInline muted />
                <canvas ref={canvasRef} style={{ display: 'none' }} />
            </div>
        </div>

        <div className="import-guide">
            <div className="guide-title">
                <div className="guide-icon">!</div> Lưu ý khi tải lên
            </div>
            <ul>
                <li>Ảnh mã QR phải rõ nét, không bị mờ hoặc mất góc</li>
                <li>Chỉ chấp nhận định dạng hình ảnh (JPG, PNG, BMP,...)</li>
                <li>Nhấn "Thêm mới" để tạo sản phẩm mới hoặc "Cập nhật" để chỉnh sửa sản phẩm hiện có</li>
            </ul>
        </div>

        <MyButton className="btn-green-download">
            <DownloadOutlined /> Tải xuống file mẫu QR
        </MyButton>

        <div className="drop-area" onClick={() => document.getElementById('qr-upload').click()}>
            <input 
                type="file" id="qr-upload" hidden 
                accept="image/*"
                onChange={e => setQrFile(e.target.files[0])}
            />
            <div className="drop-area-icon"><CloudUploadOutlined /></div>
            <p className="drop-area-hint">Chỉ hỗ trợ file ảnh (PNG, JPG, BMP,...)</p>
        </div>

        {qrFile && (
            <div className="file-item">
                <div className="file-info">
                    <FaLink /> {qrFile.name}
                </div>
                <div className="delete-file-btn" onClick={(e) => { e.stopPropagation(); setQrFile(null); }}>
                    <FaTrash />
                </div>
            </div>
        )}
      </Modal>

      <Modal
        title={<div className="modal-title-custom"><FaFilePdf /> Tải lên danh sách sản phẩm từ PDF</div>}
        open={isPDFVisible}
        onCancel={onPDFCancel}
        footer={
          <div className="modal-footer">
            <MyButton className="btn-gray-foot" onClick={onPDFCancel}>Hủy</MyButton>
            <MyButton className="btn-blue-foot" onClick={() => handleImportPDF('update')} disabled={loading}>
              <FaCloudUploadAlt /> Cập nhật
            </MyButton>
            <MyButton className="btn-blue-foot" onClick={() => handleImportPDF('create')} disabled={loading}>
              <FaCloudUploadAlt /> Thêm mới
            </MyButton>
          </div>
        }
        width={600}
        style={{ top: 20, marginBottom: 30 }}
      >
        <div className="import-guide">
            <div className="guide-title">
                <div className="guide-icon">!</div> Lưu ý khi tải lên
            </div>
            <ul>
                <li>File PDF phải đúng định dạng như mẫu</li>
                <li>Mã sản phẩm (code) và tiêu đề (name) không được để trống</li>
                <li>Giá (price) phải lớn hơn 1.000đ</li>
                <li>Chọn "Thêm mới" để tạo sản phẩm mới hoặc "Cập nhật" để chỉnh sửa sản phẩm hiện có</li>
            </ul>
        </div>

        <MyButton className="btn-green-download">
            <DownloadOutlined /> Tải xuống file mẫu PDF
        </MyButton>

        <div className="drop-area" onClick={() => document.getElementById('pdf-upload').click()}>
            <input 
                type="file" id="pdf-upload" hidden 
                accept=".pdf"
                onChange={e => setPdfFile(e.target.files[0])}
            />
            <div className="drop-area-icon"><CloudUploadOutlined /></div>
            <p className="drop-area-text">Kéo thả hoặc nhấn để chọn file PDF</p>
            <p className="drop-area-hint">Chỉ hỗ trợ tải lên file PDF (.pdf)</p>
        </div>

        {pdfFile && (
            <div className="file-item">
                <div className="file-info">
                    <FaLink /> {pdfFile.name}
                </div>
                <div className="delete-file-btn" onClick={(e) => { e.stopPropagation(); setPdfFile(null); }}>
                    <FaTrash />
                </div>
            </div>
        )}
      </Modal>
    </>
  );
};

export default ProductImport;
