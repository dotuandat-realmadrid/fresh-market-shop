import React from 'react';
import { DownloadOutlined } from '@ant-design/icons';
import MyButton from './MyButton';

/**
 * Component hỗ trợ tải xuống các file mẫu từ thư mục public
 * @param {string} fileName Tên file trong thư mục public (ví dụ: 'template.xlsx')
 * @param {string} label Nhãn hiển thị trên nút
 */
const DownloadTemplateButton = ({ label = "Tải xuống file mẫu" }) => {
    const handleDownload = (e) => {
        e.preventDefault();
        const fileName = "template.zip"; // Tên file đã nén chứa tất cả mẫu

        const link = document.createElement('a');
        link.href = `/${fileName}`;
        link.setAttribute('download', fileName);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <MyButton 
            className="btn-green-download"
            onClick={handleDownload}
        >
            <DownloadOutlined /> {label}
        </MyButton>
    );
};

export default DownloadTemplateButton;
