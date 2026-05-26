import React, { useState } from 'react';
import { Trash2, Download, AlertTriangle, Calendar } from 'lucide-react';
import api from '../services/api';
import CustomSelect from '../components/CustomSelect';
import './SettingsPage.css';

export default function SettingsPage() {
  const [module, setModule] = useState('orders');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [dataRange, setDataRange] = useState<{min: string, max: string} | null>(null);
  const [isLoadingRange, setIsLoadingRange] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [deleteMessage, setDeleteMessage] = useState({ text: '', type: '' });
  
  const [exportStartDate, setExportStartDate] = useState('');
  const [exportEndDate, setExportEndDate] = useState('');

  const modules = [
    { value: 'orders', label: 'Đơn hàng & Thanh toán' },
    { value: 'inventory', label: 'Lịch sử Kho & Giao dịch' },
    { value: 'sessions', label: 'Phiên phục vụ Bàn' },
    { value: 'resigned_staff', label: 'Nhân viên đã nghỉ' },
    { value: 'all_transactions', label: 'Tất cả dữ liệu giao dịch' },
  ];

  React.useEffect(() => {
    const fetchDataRange = async () => {
      setIsLoadingRange(true);
      try {
        const res = await api.get('/api/settings/data-range', { params: { module } });
        if (res.data.minDate && res.data.maxDate) {
          setDataRange({
            min: new Date(res.data.minDate).toLocaleDateString('vi-VN'),
            max: new Date(res.data.maxDate).toLocaleDateString('vi-VN')
          });
        } else {
          setDataRange(null);
        }
      } catch (err) {
        console.error('Lỗi khi lấy khoảng thời gian dữ liệu:', err);
        setDataRange(null);
      } finally {
        setIsLoadingRange(false);
      }
    };
    fetchDataRange();
  }, [module]);

  const handleExport = async () => {
    try {
      setIsExporting(true);
      
      const params: any = {};
      if (exportStartDate && exportEndDate) {
        params.startDate = `${exportStartDate}T00:00:00`;
        params.endDate = `${exportEndDate}T23:59:59`;
      }
      
      const response = await api.get('/api/settings/export/zip', {
        params,
        responseType: 'blob', // Important for downloading files
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `ViePOS_Data_Export_${new Date().getTime()}.zip`);
      document.body.appendChild(link);
      link.click();
      link.parentNode?.removeChild(link);
    } catch (error) {
      console.error('Export failed:', error);
      alert('Tải dữ liệu thất bại. Vui lòng thử lại.');
    } finally {
      setIsExporting(false);
    }
  };

  const handleDelete = async () => {
    if (!startDate || !endDate) return;
    
    try {
      setIsDeleting(true);
      setDeleteMessage({ text: '', type: '' });
      
      await api.delete('/api/settings/data', {
        params: {
          module,
          startDate: `${startDate}T00:00:00`,
          endDate: `${endDate}T23:59:59`
        }
      });
      
      setDeleteMessage({ text: 'Đã xóa dữ liệu thành công!', type: 'success' });
      setShowConfirmModal(false);
      setStartDate('');
      setEndDate('');
    } catch (error: any) {
      console.error('Delete failed:', error);
      setDeleteMessage({ 
        text: error.response?.data?.message || 'Có lỗi xảy ra khi xóa dữ liệu.', 
        type: 'error' 
      });
      setShowConfirmModal(false);
    } finally {
      setIsDeleting(false);
    }
  };

  const getModuleName = (val: string) => modules.find(m => m.value === val)?.label || '';

  return (
    <div className="settings-page-container">
      <div className="settings-header">
        <h1 className="settings-title">Thiết Lập Hệ Thống</h1>
      </div>

      {/* Export Section */}
      <div className="settings-section">
        <h2 className="settings-section-title">
          <Download size={20} color="#256E05" /> Sao lưu & Tải Dữ Liệu
        </h2>
        <p className="settings-section-desc">
          Tải toàn bộ dữ liệu của hệ thống (Đơn hàng, Sản phẩm, Nhân viên, Tồn kho...) dưới dạng file nén (.zip) chứa các file CSV.
        </p>
        <div className="settings-form-row">
          <div className="settings-form-group">
            <label>Từ ngày (Không bắt buộc)</label>
            <input 
              type="date" 
              className="settings-input"
              value={exportStartDate}
              onChange={(e) => setExportStartDate(e.target.value)}
            />
          </div>
          <div className="settings-form-group">
            <label>Đến ngày (Không bắt buộc)</label>
            <input 
              type="date" 
              className="settings-input"
              value={exportEndDate}
              min={exportStartDate}
              onChange={(e) => setExportEndDate(e.target.value)}
            />
          </div>
        </div>
        
        <button 
          className="btn-export-data" 
          onClick={handleExport}
          disabled={isExporting}
        >
          <Download size={18} />
          {isExporting ? 'Đang chuẩn bị dữ liệu...' : 'TẢI DỮ LIỆU (.ZIP)'}
        </button>
      </div>

      {/* Delete Section */}
      <div className="settings-section">
        <h2 className="settings-section-title" style={{ color: '#c62828' }}>
          <Trash2 size={20} color="#c62828" /> Xóa Dữ Liệu Cũ
        </h2>
        <p className="settings-section-desc">
          Chức năng này sẽ <strong>xóa cứng vĩnh viễn</strong> các dữ liệu giao dịch trong khoảng thời gian được chọn để giải phóng dung lượng. Hãy sao lưu dữ liệu trước khi thực hiện. (Dữ liệu gốc như Sản phẩm, Nhân sự sẽ không bị xóa để tránh lỗi hệ thống).
        </p>

        <div style={{ backgroundColor: '#f5f5f5', padding: '12px', borderRadius: '8px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', color: '#555' }}>
          <Calendar size={18} color="#256E05" />
          <span>
            Dữ liệu của phân hệ <strong>{getModuleName(module)}</strong> hiện có từ: {' '}
            {isLoadingRange ? 'Đang tải...' : (dataRange ? <strong style={{color: '#256E05'}}>{dataRange.min} đến {dataRange.max}</strong> : <strong>Chưa có dữ liệu</strong>)}
          </span>
        </div>

        <div className="settings-form-row">
          <div className="settings-form-group">
            <label>Phân hệ dữ liệu</label>
            <CustomSelect
              options={modules}
              value={module}
              onChange={(val) => setModule(val)}
              placeholder="Chọn phân hệ..."
            />
          </div>
          <div className="settings-form-group">
            <label>Từ ngày</label>
            <input 
              type="date" 
              className="settings-input"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              max={endDate || undefined}
            />
          </div>
          <div className="settings-form-group">
            <label>Đến ngày</label>
            <input 
              type="date" 
              className="settings-input"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              min={startDate || undefined}
            />
          </div>
        </div>

        {deleteMessage.text && (
          <div style={{ 
            padding: '12px 16px', 
            borderRadius: '8px', 
            marginBottom: '16px',
            backgroundColor: deleteMessage.type === 'success' ? '#e8f5e9' : '#ffebee',
            color: deleteMessage.type === 'success' ? '#2e7d32' : '#c62828',
            fontSize: '14px',
            fontWeight: 500
          }}>
            {deleteMessage.text}
          </div>
        )}

        <button 
          className="btn-delete-data"
          disabled={!startDate || !endDate || isDeleting}
          onClick={() => setShowConfirmModal(true)}
        >
          <Trash2 size={18} />
          {isDeleting ? 'ĐANG XÓA...' : 'XÓA DỮ LIỆU ĐÃ CHỌN'}
        </button>
      </div>

      {/* Confirm Modal */}
      {showConfirmModal && (
        <div className="settings-modal-overlay">
          <div className="settings-modal-content">
            <div className="settings-modal-header">
              <AlertTriangle size={24} color="#c62828" />
              <h3>CẢNH BÁO XÓA DỮ LIỆU</h3>
            </div>
            <div className="settings-modal-body">
              Bạn đang yêu cầu xóa vĩnh viễn dữ liệu <strong>{getModuleName(module)}</strong>.<br/><br/>
              Khoảng thời gian: <strong>{startDate.split('-').reverse().join('/')}</strong> đến <strong>{endDate.split('-').reverse().join('/')}</strong>.<br/><br/>
              <span style={{ color: '#c62828', fontWeight: 600 }}>Hành động này KHÔNG THỂ HOÀN TÁC. Bạn có chắc chắn muốn tiếp tục?</span>
            </div>
            <div className="settings-modal-footer">
              <button 
                className="settings-btn-cancel"
                onClick={() => setShowConfirmModal(false)}
                disabled={isDeleting}
              >
                Hủy bỏ
              </button>
              <button 
                className="settings-btn-confirm"
                onClick={handleDelete}
                disabled={isDeleting}
              >
                {isDeleting ? 'Đang xóa...' : 'Xác nhận Xóa'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
