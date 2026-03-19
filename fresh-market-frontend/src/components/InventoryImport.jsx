import React, { useState, useEffect, useRef } from 'react';
import MyButton from './MyButton';
import { Modal, InputNumber, App, Typography, Divider, Alert, Dropdown } from 'antd';
import { 
  FaFileExcel, FaQrcode, FaFilePdf, FaRobot, 
  FaCloudUploadAlt, FaLink, FaTrash, FaChevronDown,
  FaFileImport
} from 'react-icons/fa';
import { 
  CloudUploadOutlined, 
  DownloadOutlined,
  DownOutlined
} from '@ant-design/icons';
import jsQR from 'jsqr';
import { 
  importInventoryExcel, 
  importInventoryQR, 
  importInventoryPDF, 
  importInventoryAI 
} from '../api/inventoryReceipt';
import '../pages/Admin/ProductAdmin.css';

const { Text } = Typography;

const InventoryImport = ({ onSuccess }) => {
  const { message } = App.useApp();
  const [loading, setLoading] = useState(false);
  
  // Modal states
  const [isExcelOpen, setIsExcelOpen] = useState(false);
  const [isPDFOpen, setIsPDFOpen] = useState(false);
  const [isQROpen, setIsQROpen] = useState(false);
  const [isAIOpen, setIsAIOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  
  // File states
  const [excelFile, setExcelFile] = useState(null);
  const [pdfFile, setPdfFile] = useState(null);
  const [qrFile, setQrFile] = useState(null);
  const [qrContent, setQrContent] = useState("");
  const [aiQuantity, setAiQuantity] = useState(1);

  // QR Camera states
  const [scanning, setScanning] = useState(false);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const requestRef = useRef(null);

  // Import handlers
  const handleImportExcel = async () => {
    if (!excelFile) return message.warning("Vui lòng chọn file Excel");
    setLoading(true);
    try {
      await importInventoryExcel(excelFile);
      message.success("Import Excel phiếu nhập thành công");
      setIsExcelOpen(false);
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
      await importInventoryAI(aiQuantity);
      message.success(`Đã sinh ${aiQuantity} phiếu nhập bằng AI`);
      setIsAIOpen(false);
      setAiQuantity(1);
      if (onSuccess) onSuccess();
    } catch (error) {
      message.error(error.message || "Sinh phiếu bằng AI thất bại");
    } finally {
      setLoading(false);
    }
  };

  const handleImportQRData = (data) => {
    setQrContent(typeof data === 'object' ? JSON.stringify(data) : data);
    message.success("Đã nhận dữ liệu QR. Nhấn Nhập hàng để tiếp tục.");
  };

  const handleImportQR = async () => {
    const source = qrFile ? 'file' : (qrContent ? 'camera' : null);
    const data = qrFile || qrContent;

    if (!data) return message.warning("Vui lòng chọn file QR hoặc quét mã bằng camera");
    
    setLoading(true);
    try {
      await importInventoryQR(source, data);
      message.success("Import QR phiếu nhập thành công");
      setIsQROpen(false);
      setQrFile(null);
      setQrContent("");
      if (onSuccess) onSuccess();
    } catch (error) {
      message.error(error.message || "Import QR thất bại");
    } finally {
      setLoading(false);
    }
  };

  const handleImportPDF = async () => {
    if (!pdfFile) return message.warning("Vui lòng chọn file PDF");
    setLoading(true);
    try {
      await importInventoryPDF(pdfFile);
      message.success("Import PDF phiếu nhập thành công");
      setIsPDFOpen(false);
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
    if (isQROpen) {
      startCamera();
    } else {
      stopCamera();
    }
    return () => stopCamera();
  }, [isQROpen]);

  const importMenu = (
    <div className="import-export-dropdown">
        <div className="import-menu-item" onClick={() => { setIsExcelOpen(true); setIsDropdownOpen(false); }}><FaFileExcel style={{color: '#107c41'}} /> Import Excel</div>
        <div className="import-menu-item" onClick={() => { setIsPDFOpen(true); setIsDropdownOpen(false); }}><FaFilePdf style={{color: '#ff4d4f'}} /> Import PDF</div>
        <div className="import-menu-item" onClick={() => { setIsQROpen(true); setIsDropdownOpen(false); }}><FaQrcode /> Import QR</div>
        <div className="import-menu-item" onClick={() => { setIsAIOpen(true); setIsDropdownOpen(false); }}><FaRobot style={{color: '#722ed1'}} /> Import AI</div>
    </div>
  );

  return (
    <>
      <div style={{ display: 'inline-block' }}>
        <Dropdown 
            popupRender={() => importMenu} 
            trigger={['click']} 
            placement="bottomRight"
            open={isDropdownOpen}
            onOpenChange={setIsDropdownOpen}
        >
            <MyButton type='primary' style={{ cursor: 'pointer' }}>
                <FaFileImport /> Import <FaChevronDown size={10} style={{marginLeft: 5}} />
            </MyButton>
        </Dropdown>
      </div>

      {/* Excel Modal */}
      <Modal
        title={<div className="modal-title-custom"><FaFileExcel /> Tải lên phiếu nhập kho từ Excel</div>}
        open={isExcelOpen}
        onCancel={() => setIsExcelOpen(false)}
        footer={
          <div className="modal-footer">
            <MyButton className="btn-gray-foot" onClick={() => setIsExcelOpen(false)}>Hủy</MyButton>
            <MyButton className="btn-blue-foot" onClick={handleImportExcel} disabled={loading}>
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
                <li>File Excel phải đúng định dạng phiếu nhập kho kho</li>
                <li>Thông tin sản phẩm và số lượng không được để trống</li>
                <li>Hệ thống sẽ tạo phiếu ở trạng thái "Chờ xử lý"</li>
                <li>Nhấn "Nhập hàng" để hoàn tất quá trình tải lên</li>
            </ul>
        </div>
        
        <MyButton className="btn-green-download">
            <DownloadOutlined /> Tải xuống file mẫu Excel
        </MyButton>

        <div className="drop-area" onClick={() => document.getElementById('inv-excel-upload').click()}>
            <input 
                type="file" id="inv-excel-upload" hidden 
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

      {/* AI Modal */}
      <Modal
        title={<div className="modal-title-custom"><FaRobot /> Sinh phiếu nhập tự động bằng AI</div>}
        open={isAIOpen}
        onCancel={() => setIsAIOpen(false)}
        footer={
          <div className="modal-footer">
            <MyButton className="btn-gray-foot" onClick={() => setIsAIOpen(false)}>Hủy</MyButton>
            <MyButton className="btn-blue-foot" onClick={handleImportAI} disabled={loading}>
              <FaCloudUploadAlt /> Tạo
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
                <li>Nhập số lượng phiếu nhập muốn AI tạo tự động.</li>
                <li>Dữ liệu sẽ được sinh ngẫu nhiên với các sản phẩm có sẵn.</li>
                <li>Phiếu nhập sẽ ở trạng thái chờ xử lý.</li>
                <li>Giới hạn tạo 50 phiếu nhập mỗi lần.</li>
            </ul>
        </div>
        
        <div className="form-group" style={{marginBottom: 20}}>
            <label style={{fontSize: 18, color: '#334155', fontWeight: 400}}>Số lượng phiếu nhập:</label>
            <InputNumber 
                min={1} max={50} 
                style={{width: '100%', height: 45, borderRadius: 8, display: 'flex', alignItems: 'center'}} 
                value={aiQuantity}
                onChange={setAiQuantity}
            />
        </div>
      </Modal>

      {/* QR Modal */}
      <Modal
        title={<div className="modal-title-custom"><FaQrcode /> Tải phiếu nhập từ mã QR</div>}
        open={isQROpen}
        onCancel={() => setIsQROpen(false)}
        footer={
          <div className="modal-footer">
            <MyButton className="btn-gray-foot" onClick={() => setIsQROpen(false)}>Hủy</MyButton>
            <MyButton className="btn-blue-foot" onClick={handleImportQR} disabled={loading || (!qrFile && !qrContent)}>
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
            {qrContent && <Alert message="Đã quét được mã QR" type="success" showIcon style={{marginTop: 10}} />}
        </div>

        <div className="import-guide" style={{ marginTop: 20 }}>
            <div className="guide-title">
                <div className="guide-icon">!</div> Lưu ý khi tải lên
            </div>
            <ul>
                <li>Ảnh mã QR phải rõ nét, không bị mờ hoặc mất góc</li>
                <li>Chỉ chấp nhận định dạng hình ảnh (JPG, PNG, BMP,...)</li>
                <li>Nhấn "Nhập hàng" để hoàn tất quá trình</li>
            </ul>
        </div>

        <div className="drop-area" onClick={() => document.getElementById('inv-qr-upload').click()}>
            <input 
                type="file" id="inv-qr-upload" hidden 
                accept="image/*"
                onChange={e => setQrFile(e.target.files[0])}
            />
            <div className="drop-area-icon"><CloudUploadOutlined /></div>
            <p className="drop-area-text">Kéo thả hoặc nhấn để chọn ảnh QR</p>
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

      {/* PDF Modal */}
      <Modal
        title={<div className="modal-title-custom"><FaFilePdf /> Tải lên phiếu nhập từ PDF</div>}
        open={isPDFOpen}
        onCancel={() => setIsPDFOpen(false)}
        footer={
          <div className="modal-footer">
            <MyButton className="btn-gray-foot" onClick={() => setIsPDFOpen(false)}>Hủy</MyButton>
            <MyButton className="btn-blue-foot" onClick={handleImportPDF} disabled={loading}>
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
                <li>File PDF phải đúng định dạng phiếu nhập kho</li>
                <li>Hệ thống sẽ tự động bóc tách dữ liệu từ file PDF</li>
                <li>Kiểm tra lại thông tin sau khi import thành công</li>
                <li>Nhấn "Nhập hàng" để bắt đầu quá trình</li>
            </ul>
        </div>

        <MyButton className="btn-green-download">
            <DownloadOutlined /> Tải xuống file mẫu PDF
        </MyButton>

        <div className="drop-area" onClick={() => document.getElementById('inv-pdf-upload').click()}>
            <input 
                type="file" id="inv-pdf-upload" hidden 
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

export default InventoryImport;
