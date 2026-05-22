import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
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

interface PinRequest {
  id: string;
  user: { name: string; email: string };
  status: string;
  createdAt: string;
}

export default function StaffManagementPage() {
  const location = useLocation();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  // Determine active tab based on URL path
  const getActiveTab = () => {
    if (location.pathname.includes('/staff/pending')) return 'pending';
    if (location.pathname.includes('/staff/history')) return 'history';
    return 'list'; // Default
  };

  const activeTab = getActiveTab();

  // Tab 1 Data
  const [staffList, setStaffList] = useState<Staff[]>([]);
  const [filterStatus, setFilterStatus] = useState<string>('APPROVED'); // APPROVED or REJECTED or ALL

  // Tab 2 Data
  const [pendingStaff, setPendingStaff] = useState<Staff[]>([]);
  const [pendingPinReqs, setPendingPinReqs] = useState<PinRequest[]>([]);
  const [pendingPinResets, setPendingPinResets] = useState<PinRequest[]>([]);
  const [pendingSubTab, setPendingSubTab] = useState<'accounts' | 'pins' | 'resets'>('accounts');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Tab 3 Data
  const [historyAccounts, setHistoryAccounts] = useState<Staff[]>([]);
  const [historyPinReqs, setHistoryPinReqs] = useState<PinRequest[]>([]);
  const [historyPinResets, setHistoryPinResets] = useState<PinRequest[]>([]);

  const fetchTab1Data = async () => {
    try {
      setLoading(true);
      const res = await staffAPI.getAll();
      setStaffList(res.data);
    } catch (err) {
      console.error("Lỗi:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchTab2Data = async () => {
    try {
      setLoading(true);
      const [accRes, pinRes, resetRes] = await Promise.all([
        staffAPI.getPending(),
        staffAPI.getPendingPinRequests(),
        staffAPI.getPendingPinResets()
      ]);
      setPendingStaff(accRes.data.sort((a: any, b: any) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()));
      setPendingPinReqs(pinRes.data.sort((a: any, b: any) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()));
      setPendingPinResets(resetRes.data.sort((a: any, b: any) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()));
    } catch (err) {
      console.error("Lỗi:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchTab3Data = async () => {
    try {
      setLoading(true);
      const [accRes, pinRes, resetRes] = await Promise.all([
        staffAPI.getHistoryAccounts(),
        staffAPI.getHistoryPinRequests(),
        staffAPI.getHistoryPinResets()
      ]);
      setHistoryAccounts(accRes.data);
      setHistoryPinReqs(pinRes.data);
      setHistoryPinResets(resetRes.data);
    } catch (err) {
      console.error("Lỗi:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'list') fetchTab1Data();
    else if (activeTab === 'pending') fetchTab2Data();
    else if (activeTab === 'history') fetchTab3Data();
  }, [activeTab]);

  useEffect(() => {
    setSelectedIds([]);
  }, [pendingSubTab, activeTab]);

  const showMessage = (msg: string) => {
    setMessage(msg);
    setTimeout(() => setMessage(''), 3000);
  };

  // ---- ACTIONS ----
  const handleApproveAccount = async (id: string, name: string) => {
    try {
      await staffAPI.approve(id);
      showMessage(`Đã duyệt tài khoản cho nhân viên ${name}.`);
      fetchTab2Data();
    } catch (err) {
      alert("Lỗi khi duyệt tài khoản!");
    }
  };

  const handleRejectAccount = async (id: string, name: string) => {
    if (window.confirm(`Bạn có chắc chắn muốn từ chối tài khoản ${name}?`)) {
      try {
        await staffAPI.reject(id);
        showMessage(`Đã từ chối tài khoản ${name}.`);
        fetchTab2Data();
      } catch (err) {
        alert("Lỗi khi từ chối tài khoản!");
      }
    }
  };

  const handleApprovePin = async (id: string, name: string) => {
    try {
      await staffAPI.approvePinRequest(id);
      showMessage(`Đã duyệt yêu cầu đổi mã PIN của ${name}.`);
      fetchTab2Data();
    } catch (err) {
      alert("Lỗi khi duyệt mã PIN!");
    }
  };

  const handleRejectPin = async (id: string, name: string) => {
    if (window.confirm(`Bạn có chắc chắn muốn từ chối yêu cầu đổi mã PIN của ${name}?`)) {
      try {
        await staffAPI.rejectPinRequest(id);
        showMessage(`Đã từ chối yêu cầu đổi mã PIN của ${name}.`);
        fetchTab2Data();
      } catch (err) {
        alert("Lỗi khi từ chối mã PIN!");
      }
    }
  };

  const handleApprovePinReset = async (id: string, name: string) => {
    try {
      await staffAPI.approvePinReset(id);
      showMessage(`Đã duyệt yêu cầu cấp lại mã PIN của ${name}.`);
      fetchTab2Data();
    } catch (err) {
      alert("Lỗi khi duyệt cấp lại mã PIN!");
    }
  };

  const handleRejectPinReset = async (id: string, name: string) => {
    if (window.confirm(`Bạn có chắc chắn muốn từ chối yêu cầu cấp lại mã PIN của ${name}?`)) {
      try {
        await staffAPI.rejectPinReset(id);
        showMessage(`Đã từ chối yêu cầu cấp lại mã PIN của ${name}.`);
        fetchTab2Data();
      } catch (err) {
        alert("Lỗi khi từ chối cấp lại mã PIN!");
      }
    }
  };

  const handleApproveMultiple = async () => {
    if (selectedIds.length === 0) return;
    if (!window.confirm(`Bạn có chắc chắn muốn duyệt ${selectedIds.length} yêu cầu?`)) return;
    
    try {
      setLoading(true);
      if (pendingSubTab === 'accounts') {
        await Promise.all(selectedIds.map(id => staffAPI.approve(id)));
      } else if (pendingSubTab === 'pins') {
        await Promise.all(selectedIds.map(id => staffAPI.approvePinRequest(id)));
      } else if (pendingSubTab === 'resets') {
        await Promise.all(selectedIds.map(id => staffAPI.approvePinReset(id)));
      }
      showMessage(`Đã duyệt thành công ${selectedIds.length} yêu cầu.`);
      setSelectedIds([]);
      fetchTab2Data();
    } catch (err) {
      alert("Có lỗi khi duyệt hàng loạt!");
    } finally {
      setLoading(false);
    }
  };

  const toggleSelectAll = (checked: boolean, allIds: string[]) => {
    if (checked) {
      setSelectedIds(allIds);
    } else {
      setSelectedIds([]);
    }
  };

  const toggleSelectOne = (id: string) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter(sId => sId !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  // ---- RENDERS ----
  const renderListTab = () => {
    const filtered = staffList.filter(s => {
      if (filterStatus === 'ALL') return true;
      if (filterStatus === 'APPROVED') return s.status === 'APPROVED';
      if (filterStatus === 'REJECTED') return s.status === 'REJECTED'; // Ví dụ nghỉ việc/khoá
      return true;
    });

    return (
      <div>
        <div style={{ marginBottom: '16px', display: 'flex', gap: '10px', alignItems: 'center' }}>
          <span style={{ fontWeight: 600 }}>Lọc theo trạng thái:</span>
          <select 
            value={filterStatus} 
            onChange={(e) => setFilterStatus(e.target.value)}
            style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
          >
            <option value="APPROVED">Đang làm việc</option>
            <option value="REJECTED">Đã nghỉ/Khoá</option>
            <option value="ALL">Tất cả</option>
          </select>
        </div>

        {loading ? <p>Đang tải...</p> : (
          <table className="staff-table" style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ backgroundColor: '#f5f5f5', borderBottom: '2px solid #ddd' }}>
                <th style={{ padding: '12px 16px' }}>Họ và Tên</th>
                <th style={{ padding: '12px 16px' }}>Email</th>
                <th style={{ padding: '12px 16px' }}>Số điện thoại</th>
                <th style={{ padding: '12px 16px' }}>Trạng thái</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(staff => (
                <tr key={staff.id} style={{ borderBottom: '1px solid #eee' }}>
                  <td style={{ padding: '12px 16px' }}>{staff.name}</td>
                  <td style={{ padding: '12px 16px' }}>{staff.email}</td>
                  <td style={{ padding: '12px 16px' }}>{staff.phone}</td>
                  <td style={{ padding: '12px 16px' }}>
                    <span style={{
                      padding: '4px 8px', borderRadius: '4px', fontSize: '12px',
                      backgroundColor: staff.status === 'APPROVED' ? '#d4edda' : '#f8d7da',
                      color: staff.status === 'APPROVED' ? '#155724' : '#721c24'
                    }}>
                      {staff.status === 'APPROVED' ? 'Đang làm việc' : 'Đã nghỉ/Khoá'}
                    </span>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={4} style={{ padding: '20px', textAlign: 'center', color: '#888' }}>Không có dữ liệu.</td></tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    );
  };

  const renderPendingTab = () => (
    <div>
      {loading && <p>Đang tải...</p>}
      
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', borderBottom: '1px solid #ddd', marginBottom: '20px' }}>
        <div style={{ display: 'flex', gap: '20px' }}>
          <div 
            className={`admin-tab ${pendingSubTab === 'accounts' ? 'active' : ''}`}
            onClick={() => setPendingSubTab('accounts')}
            style={{ padding: '8px 16px', fontSize: '15px' }}
          >
            Tài khoản mới
            {pendingStaff.length > 0 && <span className="badge" style={{ top: '-5px', right: '-15px' }}>{pendingStaff.length}</span>}
          </div>
          <div 
            className={`admin-tab ${pendingSubTab === 'pins' ? 'active' : ''}`}
            onClick={() => setPendingSubTab('pins')}
            style={{ padding: '8px 16px', fontSize: '15px' }}
          >
            Đổi mã PIN
            {pendingPinReqs.length > 0 && <span className="badge" style={{ top: '-5px', right: '-15px' }}>{pendingPinReqs.length}</span>}
          </div>
          <div 
            className={`admin-tab ${pendingSubTab === 'resets' ? 'active' : ''}`}
            onClick={() => setPendingSubTab('resets')}
            style={{ padding: '8px 16px', fontSize: '15px' }}
          >
            Quên mật khẩu
            {pendingPinResets.length > 0 && <span className="badge" style={{ top: '-5px', right: '-15px' }}>{pendingPinResets.length}</span>}
          </div>
        </div>

        <div style={{ paddingBottom: '8px', visibility: selectedIds.length > 0 ? 'visible' : 'hidden', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span style={{ fontSize: '14px', color: '#444' }}>Đã chọn <b>{selectedIds.length}</b></span>
          <button onClick={handleApproveMultiple} style={{ padding: '6px 12px', backgroundColor: '#256E05', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', fontSize: '13px' }}>
            Duyệt tất cả
          </button>
        </div>
      </div>

      {pendingSubTab === 'accounts' && (
        <div style={{ marginBottom: '30px' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ backgroundColor: '#f5f5f5', borderBottom: '2px solid #ddd' }}>
                <th style={{ padding: '12px 16px', width: '40px' }}>
                  <input 
                    type="checkbox" 
                    checked={pendingStaff.length > 0 && selectedIds.length === pendingStaff.length}
                    onChange={(e) => toggleSelectAll(e.target.checked, pendingStaff.map(s => s.id))}
                  />
                </th>
                <th style={{ padding: '12px 16px' }}>Họ và Tên</th>
                <th style={{ padding: '12px 16px' }}>Email</th>
                <th style={{ padding: '12px 16px' }}>Hành động</th>
              </tr>
            </thead>
            <tbody>
              {pendingStaff.map(staff => (
                <tr key={staff.id} style={{ borderBottom: '1px solid #eee' }}>
                  <td style={{ padding: '12px 16px' }}>
                    <input 
                      type="checkbox" 
                      checked={selectedIds.includes(staff.id)}
                      onChange={() => toggleSelectOne(staff.id)}
                    />
                  </td>
                  <td style={{ padding: '12px 16px' }}>{staff.name}</td>
                  <td style={{ padding: '12px 16px' }}>{staff.email}</td>
                  <td style={{ padding: '12px 16px' }}>
                    <button onClick={() => handleApproveAccount(staff.id, staff.name)} className="btn-approve">Duyệt</button>
                    <button onClick={() => handleRejectAccount(staff.id, staff.name)} className="btn-reject">Từ chối</button>
                  </td>
                </tr>
              ))}
              {pendingStaff.length === 0 && <tr><td colSpan={4} style={{ padding: '20px', textAlign: 'center', color: '#888' }}>Không có yêu cầu nào.</td></tr>}
            </tbody>
          </table>
        </div>
      )}

      {pendingSubTab === 'pins' && (
        <div>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ backgroundColor: '#f5f5f5', borderBottom: '2px solid #ddd' }}>
                <th style={{ padding: '12px 16px', width: '40px' }}>
                  <input 
                    type="checkbox" 
                    checked={pendingPinReqs.length > 0 && selectedIds.length === pendingPinReqs.length}
                    onChange={(e) => toggleSelectAll(e.target.checked, pendingPinReqs.map(s => s.id))}
                  />
                </th>
                <th style={{ padding: '12px 16px' }}>Họ và Tên</th>
                <th style={{ padding: '12px 16px' }}>Email</th>
                <th style={{ padding: '12px 16px' }}>Thời gian gửi</th>
                <th style={{ padding: '12px 16px' }}>Hành động</th>
              </tr>
            </thead>
            <tbody>
              {pendingPinReqs.map(req => (
                <tr key={req.id} style={{ borderBottom: '1px solid #eee' }}>
                  <td style={{ padding: '12px 16px' }}>
                    <input 
                      type="checkbox" 
                      checked={selectedIds.includes(req.id)}
                      onChange={() => toggleSelectOne(req.id)}
                    />
                  </td>
                  <td style={{ padding: '12px 16px' }}>{req.user?.name}</td>
                  <td style={{ padding: '12px 16px' }}>{req.user?.email}</td>
                  <td style={{ padding: '12px 16px' }}>{new Date(req.createdAt).toLocaleString('vi-VN')}</td>
                  <td style={{ padding: '12px 16px' }}>
                    <button onClick={() => handleApprovePin(req.id, req.user?.name)} className="btn-approve">Duyệt</button>
                    <button onClick={() => handleRejectPin(req.id, req.user?.name)} className="btn-reject">Từ chối</button>
                  </td>
                </tr>
              ))}
              {pendingPinReqs.length === 0 && <tr><td colSpan={5} style={{ padding: '20px', textAlign: 'center', color: '#888' }}>Không có yêu cầu nào.</td></tr>}
            </tbody>
          </table>
        </div>
      )}

      {pendingSubTab === 'resets' && (
        <div>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ backgroundColor: '#f5f5f5', borderBottom: '2px solid #ddd' }}>
                <th style={{ padding: '12px 16px', width: '40px' }}>
                  <input 
                    type="checkbox" 
                    checked={pendingPinResets.length > 0 && selectedIds.length === pendingPinResets.length}
                    onChange={(e) => toggleSelectAll(e.target.checked, pendingPinResets.map(s => s.id))}
                  />
                </th>
                <th style={{ padding: '12px 16px' }}>Họ và Tên</th>
                <th style={{ padding: '12px 16px' }}>Email</th>
                <th style={{ padding: '12px 16px' }}>Thời gian gửi</th>
                <th style={{ padding: '12px 16px' }}>Hành động</th>
              </tr>
            </thead>
            <tbody>
              {pendingPinResets.map(req => (
                <tr key={req.id} style={{ borderBottom: '1px solid #eee' }}>
                  <td style={{ padding: '12px 16px' }}>
                    <input 
                      type="checkbox" 
                      checked={selectedIds.includes(req.id)}
                      onChange={() => toggleSelectOne(req.id)}
                    />
                  </td>
                  <td style={{ padding: '12px 16px' }}>{req.user?.name}</td>
                  <td style={{ padding: '12px 16px' }}>{req.user?.email}</td>
                  <td style={{ padding: '12px 16px' }}>{new Date(req.createdAt).toLocaleString('vi-VN')}</td>
                  <td style={{ padding: '12px 16px' }}>
                    <button onClick={() => handleApprovePinReset(req.id, req.user?.name)} className="btn-approve">Duyệt</button>
                    <button onClick={() => handleRejectPinReset(req.id, req.user?.name)} className="btn-reject">Từ chối</button>
                  </td>
                </tr>
              ))}
              {pendingPinResets.length === 0 && <tr><td colSpan={5} style={{ padding: '20px', textAlign: 'center', color: '#888' }}>Không có yêu cầu nào.</td></tr>}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );

  const renderHistoryTab = () => {
    const combinedHistory = [
      ...historyAccounts.map(a => ({ id: a.id, name: a.name, email: a.email, type: 'Cấp tài khoản mới', status: a.status, date: a.createdAt })),
      ...historyPinReqs.map(p => ({ id: p.id, name: p.user?.name, email: p.user?.email, type: 'Đổi mã PIN', status: p.status, date: p.createdAt })),
      ...historyPinResets.map(r => ({ id: r.id, name: r.user?.name, email: r.user?.email, type: 'Quên mã PIN', status: r.status, date: r.createdAt }))
    ];
    
    combinedHistory.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    return (
      <div>
        {loading && <p>Đang tải...</p>}
        
        <div style={{ marginBottom: '30px' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ backgroundColor: '#f5f5f5', borderBottom: '2px solid #ddd' }}>
                <th style={{ padding: '12px 16px' }}>Họ và Tên</th>
                <th style={{ padding: '12px 16px' }}>Email</th>
                <th style={{ padding: '12px 16px' }}>Loại yêu cầu</th>
                <th style={{ padding: '12px 16px' }}>Kết quả</th>
                <th style={{ padding: '12px 16px' }}>Thời gian duyệt</th>
              </tr>
            </thead>
            <tbody>
              {combinedHistory.map((item, index) => (
                <tr key={`${item.id}-${index}`} style={{ borderBottom: '1px solid #eee' }}>
                  <td style={{ padding: '12px 16px' }}>{item.name}</td>
                  <td style={{ padding: '12px 16px' }}>{item.email}</td>
                  <td style={{ padding: '12px 16px' }}>
                    <span style={{ 
                      padding: '4px 8px', borderRadius: '4px', fontSize: '12px',
                      backgroundColor: item.type === 'Cấp tài khoản mới' ? '#e3f2fd' : item.type === 'Đổi mã PIN' ? '#fff3cd' : '#f8d7da',
                      color: item.type === 'Cấp tài khoản mới' ? '#0d47a1' : item.type === 'Đổi mã PIN' ? '#856404' : '#721c24'
                    }}>
                      {item.type}
                    </span>
                  </td>
                  <td style={{ padding: '12px 16px', fontWeight: 'bold', color: item.status === 'APPROVED' ? '#256E05' : '#dc3545' }}>
                    {item.status === 'APPROVED' ? 'Đã duyệt' : 'Đã từ chối'}
                  </td>
                  <td style={{ padding: '12px 16px' }}>{new Date(item.date).toLocaleString('vi-VN')}</td>
                </tr>
              ))}
              {combinedHistory.length === 0 && <tr><td colSpan={5} style={{ padding: '20px', textAlign: 'center', color: '#888' }}>Không có dữ liệu lịch sử.</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  return (
    <div className="report-page">
      <div className="report-card" style={{ display: 'block', padding: '24px' }}>
        
        {message && (
          <div style={{ backgroundColor: '#d4edda', color: '#155724', padding: '12px 16px', borderRadius: '8px', marginBottom: '20px', fontSize: '14px' }}>
            {message}
          </div>
        )}

        <div style={{ marginTop: '0px' }}>
          {activeTab === 'list' && renderListTab()}
          {activeTab === 'pending' && renderPendingTab()}
          {activeTab === 'history' && renderHistoryTab()}
        </div>
      </div>
    </div>
  );
}
