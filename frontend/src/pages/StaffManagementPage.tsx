import { useEffect, useState } from 'react';
import { staffAPI } from '../services/api';
import './DashboardPage.css';

interface Staff {
  id: string;
  name: string;
  email: string;
  phone: string;
  status: string;
  createdAt: string;
}

export default function StaffManagementPage() {
  const [pendingStaff, setPendingStaff] = useState<Staff[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');

  const fetchPendingStaff = async () => {
    try {
      setLoading(true);
      const res = await staffAPI.getPending();
      setPendingStaff(res.data);
    } catch (err) {
      console.error("Lỗi khi tải danh sách chờ duyệt:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPendingStaff();
  }, []);

  const handleApprove = async (id: string, name: string) => {
    try {
      await staffAPI.approve(id);
      setMessage(`Đã duyệt tài khoản cho nhân viên ${name}. Email thông báo đã được gửi.`);
      fetchPendingStaff(); // Refresh list
      
      // Auto clear message after 3 seconds
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      alert("Lỗi khi duyệt tài khoản!");
    }
  };

  const handleReject = async (id: string, name: string) => {
    if (window.confirm(`Bạn có chắc chắn muốn từ chối tài khoản ${name}?`)) {
      try {
        await staffAPI.reject(id);
        setMessage(`Đã từ chối tài khoản ${name}.`);
        fetchPendingStaff();
        
        setTimeout(() => setMessage(''), 3000);
      } catch (err) {
        alert("Lỗi khi từ chối tài khoản!");
      }
    }
  };

  return (
    <div className="report-page">
      <div className="report-card" style={{ display: 'block', padding: '24px' }}>
        <h2 className="report-title" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
          Quản Lý Nhân Viên
          <span style={{ fontSize: '14px', backgroundColor: '#fff3cd', color: '#856404', padding: '4px 12px', borderRadius: '16px', fontWeight: 'normal' }}>
            {pendingStaff.length} Yêu cầu chờ duyệt
          </span>
        </h2>
        
        {message && (
          <div style={{ backgroundColor: '#d4edda', color: '#155724', padding: '12px 16px', borderRadius: '8px', marginBottom: '20px', fontSize: '14px' }}>
            {message}
          </div>
        )}

        <div style={{ marginTop: '20px' }}>
          {loading ? (
            <p>Đang tải dữ liệu...</p>
          ) : pendingStaff.length === 0 ? (
            <div style={{ padding: '40px 20px', textAlign: 'center', color: '#888', backgroundColor: '#f9f9f9', borderRadius: '8px' }}>
              Không có yêu cầu tạo tài khoản nào đang chờ duyệt.
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '600px' }}>
                <thead>
                  <tr style={{ backgroundColor: '#f5f5f5', borderBottom: '2px solid #ddd' }}>
                    <th style={{ padding: '12px 16px', fontWeight: 600, color: '#333' }}>Họ và Tên</th>
                    <th style={{ padding: '12px 16px', fontWeight: 600, color: '#333' }}>Email</th>
                    <th style={{ padding: '12px 16px', fontWeight: 600, color: '#333' }}>Số điện thoại</th>
                    <th style={{ padding: '12px 16px', fontWeight: 600, color: '#333', textAlign: 'center' }}>Hành động</th>
                  </tr>
                </thead>
                <tbody>
                  {pendingStaff.map(staff => (
                    <tr key={staff.id} style={{ borderBottom: '1px solid #eee' }}>
                      <td style={{ padding: '12px 16px' }}>{staff.name}</td>
                      <td style={{ padding: '12px 16px' }}>{staff.email}</td>
                      <td style={{ padding: '12px 16px' }}>{staff.phone}</td>
                      <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                        <button 
                          onClick={() => handleApprove(staff.id, staff.name)}
                          style={{ backgroundColor: '#256E05', color: 'white', border: 'none', padding: '6px 16px', borderRadius: '6px', cursor: 'pointer', marginRight: '8px', fontWeight: 500 }}
                        >
                          Duyệt
                        </button>
                        <button 
                          onClick={() => handleReject(staff.id, staff.name)}
                          style={{ backgroundColor: '#fff', color: '#dc3545', border: '1px solid #dc3545', padding: '6px 16px', borderRadius: '6px', cursor: 'pointer', fontWeight: 500 }}
                        >
                          Từ chối
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
