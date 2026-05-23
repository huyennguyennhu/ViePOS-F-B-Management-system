import { useState } from 'react';
import { Search, X } from 'lucide-react';
import './InventoryHistoryPage.css';
import './InventoryManagementPage.css'; // Reuse modal styles

// Mock Data matching the screenshot
const mockHistoryData = [
  { id: 1, time: '13:47 19/05/2026', product: 'Cà phê sữa', sku: 'SKU - BJBMSH', action: 'Nhập kho', quantity: 20, oldStock: 4, newStock: 24, staff: 'Nguyễn Văn A', refCode: 'NK1234' },
  { id: 2, time: '13:47 19/05/2026', product: 'Cà phê sữa', sku: 'SKU - BJBMSH', action: 'Nhập kho', quantity: 20, oldStock: 4, newStock: 24, staff: 'Nguyễn Văn A', refCode: 'NK1234' },
  { id: 3, time: '13:47 19/05/2026', product: 'Cà phê sữa', sku: 'SKU - BJBMSH', action: 'Xuất kho', quantity: -5, oldStock: 5, newStock: 0, staff: 'Nguyễn Văn A', refCode: 'XK1234' },
  { id: 4, time: '08:30 19/05/2026', product: 'Cà phê muối', sku: 'SKU - BJBMSH', action: 'Bán hàng', quantity: -1, oldStock: 5, newStock: 4, staff: 'Nguyễn Văn A', refCode: 'OR0123' },
];

export default function InventoryHistoryPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const today = new Date();
  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

  const [fromDate, setFromDate] = useState('2026-05-19');
  const [toDate, setToDate] = useState('2026-05-19');
  const [actionFilter, setActionFilter] = useState('Tất cả loại biến động');
  const [selectedTransaction, setSelectedTransaction] = useState<any>(null);

  const handleFromDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    if (!val) {
      setFromDate('');
      return;
    }
    if (val > toDate && toDate !== '') {
      setFromDate(toDate);
    } else {
      setFromDate(val);
    }
  };

  const handleToDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    if (!val) {
      setToDate('');
      return;
    }
    if (val > todayStr) {
      setToDate(todayStr);
      if (todayStr < fromDate && fromDate !== '') setFromDate(todayStr);
    } else {
      setToDate(val);
      if (val < fromDate && fromDate !== '') {
        setFromDate(val);
      }
    }
  };

  const handleRowClick = (item: any) => {
    // Generate some mock details for the transaction
    const transactionDetails = {
       refCode: item.refCode,
       time: item.time,
       staff: item.staff,
       action: item.action,
       note: item.action === 'Nhập kho' ? 'Nhập hàng định kỳ tuần 3 tháng 5' : item.action === 'Xuất kho' ? 'Xuất nguyên liệu cho ca sáng' : 'Đơn hàng bán trực tiếp',
       items: [
         item,
         { ...item, id: 999, product: 'Sữa đặc Ngôi Sao', sku: 'SKU - SDNS', quantity: item.action === 'Nhập kho' ? 10 : item.action === 'Xuất kho' ? -2 : -1, oldStock: 15, newStock: item.action === 'Nhập kho' ? 25 : item.action === 'Xuất kho' ? 13 : 14 }
       ]
    };
    setSelectedTransaction(transactionDetails);
  };

  // Simple filtering (mock implementation)
  const filteredData = mockHistoryData.filter(item => {
    const matchesSearch = item.product.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          item.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          item.staff.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesAction = actionFilter === 'Tất cả loại biến động' || item.action === actionFilter;
    return matchesSearch && matchesAction;
  });

  const getActionBadgeClass = (action: string) => {
    switch (action) {
      case 'Nhập kho': return 'badge-import';
      case 'Xuất kho': return 'badge-export';
      case 'Bán hàng': return 'badge-sale';
      default: return '';
    }
  };

  const getQuantityClass = (qty: number) => {
    return qty > 0 ? 'qty-positive' : 'qty-negative';
  };

  const formatQuantity = (qty: number) => {
    return qty > 0 ? `+ ${qty}` : `- ${Math.abs(qty)}`;
  };

  return (
    <div className="inventory-history-container">
      <div className="history-sticky-header">
        <h1 className="history-title">LỊCH SỬ BIẾN ĐỘNG KHO</h1>

        {/* Metrics Cards */}
        <div className="history-metrics-grid">
        <div className="history-metric-card card-gray">
          <div className="metric-card-title">Số lượng lượt biến động</div>
          <div className="metric-card-value-container">
            <span className="metric-value-number">4</span>
            <span className="metric-value-unit">Lượt thao tác</span>
          </div>
          <div className="metric-card-footer">
            {/* <span>ⓘ Số giao dịch đã lọc theo điều kiện</span> */}
          </div>
        </div>
        
        <div className="history-metric-card card-green">
          <div className="metric-card-title">Tăng tồn kho</div>
          <div className="metric-card-value-container">
            <span className="metric-value-number">+ 40</span>
            <span className="metric-value-unit">Sản phẩm</span>
          </div>
          <div className="metric-card-footer">
            {/* <span style={{ color: '#2ea112' }}>↗ Hàng nhập kho</span> */}
          </div>
        </div>

        <div className="history-metric-card card-red">
          <div className="metric-card-title">Giảm tồn kho</div>
          <div className="metric-card-value-container">
            <span className="metric-value-number">- 6</span>
            <span className="metric-value-unit">Sản phẩm</span>
          </div>
          <div className="metric-card-footer">
            {/* <span style={{ color: '#dc3545' }}>↘ Khấu hao do bán hàng</span> */}
          </div>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="history-filters-bar">
        <div className="history-search-container">
          <Search className="history-search-icon" size={18} />
          <input 
            type="text" 
            className="history-search-input" 
            placeholder="Tìm sản phẩm, SKU, nhân viên,..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="date-filter-group">
          <span className="date-label">Từ:</span>
          <input 
            type="date" 
            className="date-input" 
            value={fromDate}
            max={toDate}
            onChange={handleFromDateChange}
          />
        </div>

        <div className="date-filter-group">
          <span className="date-label">Đến:</span>
          <input 
            type="date" 
            className="date-input" 
            value={toDate}
            max={todayStr}
            onChange={handleToDateChange}
          />
        </div>

        <select 
          className="history-type-select"
          value={actionFilter}
          onChange={(e) => setActionFilter(e.target.value)}
        >
          <option value="Tất cả loại biến động">Tất cả loại biến động</option>
          <option value="Nhập kho">Nhập kho</option>
          <option value="Xuất kho">Xuất kho</option>
          <option value="Bán hàng">Bán hàng</option>
        </select>

          <div className="history-results-count">
            {filteredData.length} kết quả
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="history-table-container">
        <table className="history-table">
          <thead>
            <tr>
              <th style={{ width: '13%' }}>Thời Gian</th>
              <th style={{ width: '20%' }}>Sản phẩm / SKU</th>
              <th style={{ width: '14%', textAlign: 'center' }}>Hành Động</th>
              <th style={{ width: '10%', textAlign: 'center' }}>Số Lượng</th>
              <th style={{ width: '14%', textAlign: 'center' }}>Biến Động</th>
              <th style={{ width: '14%', textAlign: 'center' }}>Nhân Viên</th>
              <th style={{ width: '15%', textAlign: 'center' }}>Mã Tham Chiếu</th>
            </tr>
          </thead>
          <tbody>
            {filteredData.length > 0 ? (
              filteredData.map((item) => (
                <tr key={item.id} onClick={() => handleRowClick(item)} className="history-table-row clickable-row">
                  <td className="history-time">{item.time}</td>
                  <td>
                    <div className="history-product-name">{item.product}</div>
                    <div className="history-sku">{item.sku}</div>
                  </td>
                  <td style={{ textAlign: 'center' }}>
                    <span className={`action-badge ${getActionBadgeClass(item.action)}`}>
                      {item.action}
                    </span>
                  </td>
                  <td style={{ textAlign: 'center' }} className={getQuantityClass(item.quantity)}>
                    {formatQuantity(item.quantity)}
                  </td>
                  <td style={{ textAlign: 'center' }} className="stock-change">
                    {item.oldStock} → {item.newStock}
                  </td>
                  <td style={{ textAlign: 'center' }}>{item.staff}</td>
                  <td style={{ textAlign: 'center' }} className="ref-code">{item.refCode}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={7} style={{ padding: '32px', textAlign: 'center', color: '#888' }}>
                  Không có dữ liệu phù hợp với bộ lọc
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Transaction Detail Modal */}
      {selectedTransaction && (
        <div className="import-modal-overlay">
          <div className="import-modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="import-modal-header">
              <h2>Chi tiết phiếu {selectedTransaction.refCode}</h2>
              <button className="import-modal-close" onClick={() => setSelectedTransaction(null)}>
                <X size={24} color="#333" />
              </button>
            </div>
            
            <div className="import-modal-body">
              {/* Left Pane */}
              <div className="import-modal-left">
                <h3 className="pane-title">Thông tin chung</h3>
                <div className="form-group">
                  <label>Mã Phiếu</label>
                  <input type="text" value={selectedTransaction.refCode} disabled className="disabled-input" />
                </div>
                <div className="form-group">
                  <label>Người thực hiện</label>
                  <input type="text" value={selectedTransaction.staff} disabled className="disabled-input" />
                </div>
                <div className="form-group">
                  <label>Thời gian</label>
                  <input type="text" value={selectedTransaction.time} disabled className="disabled-input" />
                </div>
                <div className="form-group">
                  <label>Ghi chú</label>
                  <textarea 
                    value={selectedTransaction.note}
                    disabled
                    rows={4}
                    className="disabled-input"
                  ></textarea>
                </div>
              </div>
              
              {/* Vertical Divider */}
              <div className="import-modal-divider"></div>

              {/* Right Pane */}
              <div className="import-modal-right">
                <h3 className="pane-title">Danh sách sản phẩm ({selectedTransaction.action})</h3>
                
                <div className="import-table-container">
                  <table className="import-table">
                    <thead>
                      <tr>
                        <th style={{ width: '40%' }}>Sản Phẩm</th>
                        <th style={{ width: '20%', textAlign: 'center' }}>Số lượng</th>
                        <th style={{ width: '40%', textAlign: 'center' }}>Biến động tồn</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedTransaction.items.map((row: any, index: number) => (
                        <tr key={index}>
                          <td>
                            <div style={{ fontWeight: 600, color: '#333' }}>{row.product}</div>
                            <div style={{ fontSize: '12px', color: '#888' }}>{row.sku}</div>
                          </td>
                          <td style={{ textAlign: 'center' }} className={getQuantityClass(row.quantity)}>
                            {formatQuantity(row.quantity)}
                          </td>
                          <td style={{ textAlign: 'center' }} className="stock-change">
                            {row.oldStock} → {row.newStock}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="import-actions" style={{ justifyContent: 'flex-end', marginTop: '24px' }}>
                  <button 
                    onClick={() => setSelectedTransaction(null)} 
                    style={{ 
                      backgroundColor: '#f1f1f1', 
                      color: '#666', 
                      border: 'none', 
                      padding: '10px 24px',
                      borderRadius: '8px',
                      fontWeight: 600,
                      cursor: 'pointer',
                      transition: 'all 0.2s'
                    }}
                    onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#e2e2e2'}
                    onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#f1f1f1'}
                  >
                    ĐÓNG
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
