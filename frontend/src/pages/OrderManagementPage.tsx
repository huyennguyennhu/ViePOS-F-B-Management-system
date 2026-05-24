import { useState } from 'react';
import { Search, FileText } from 'lucide-react';
import * as XLSX from 'xlsx';
import iconExportExcel from '../../assets/icon/exportexcel_white.png';
import './OrderManagementPage.css';

interface OrderProduct {
  id: string;
  name: string;
  description: string;
  price: number;
  quantity: number;
  total: number;
}

interface Order {
  id: string;
  date: string;
  timeIn: string;
  timeOut: string;
  employee: string;
  totalAmount: number;
  status: 'Hoàn tất' | 'Đã hủy';
  reason?: string;
  customerPaid: number;
  change: number;
  paymentMethod?: 'Tiền mặt' | 'Chuyển khoản';
  products: OrderProduct[];
}

// Mock Data matching the screenshot
const MOCK_ORDERS: Order[] = [
  {
    id: 'ORD023_1', // Using unique IDs for react keys even if display IDs repeat
    date: '19/05/2026',
    timeIn: '14:20:56',
    timeOut: '14:45:00',
    employee: 'Nguyễn Văn A',
    totalAmount: 70000,
    status: 'Hoàn tất',
    customerPaid: 70000,
    change: 0,
    paymentMethod: 'Chuyển khoản',
    products: [
      { id: 'p1', name: 'Trà Đào', description: 'Tại chỗ 4 giờ', price: 35000, quantity: 1, total: 35000 },
      { id: 'p2', name: 'Trà Trái Cây', description: 'Tại chỗ 4 giờ', price: 35000, quantity: 1, total: 35000 },
    ]
  },
  {
    id: 'ORD022',
    date: '19/05/2026',
    timeIn: '14:20:56',
    timeOut: '--',
    employee: 'Nguyễn Văn A',
    totalAmount: 35000,
    status: 'Đã hủy',
    reason: 'Nhân viên đặt nhầm món',
    customerPaid: 0,
    change: 0,
    products: [
      { id: 'p3', name: 'Trà Đào', description: 'Tại chỗ 4 giờ', price: 35000, quantity: 1, total: 35000 }
    ]
  },
  {
    id: 'ORD023_2',
    date: '19/05/2026',
    timeIn: '14:20:56',
    timeOut: '14:30:00',
    employee: 'Nguyễn Văn A',
    totalAmount: 25000,
    status: 'Hoàn tất',
    customerPaid: 150000,
    change: 45000,
    paymentMethod: 'Tiền mặt',
    products: [
      { id: 'p4', name: 'Cà phê đen', description: 'Mang đi', price: 25000, quantity: 1, total: 25000 }
    ]
  },
  {
    id: 'ORD023_3',
    date: '19/05/2026',
    timeIn: '14:20:56',
    timeOut: '15:10:00',
    employee: 'Nguyễn Văn A',
    totalAmount: 105000,
    status: 'Hoàn tất',
    customerPaid: 105000,
    change: 0,
    paymentMethod: 'Chuyển khoản',
    products: [
      { id: 'p5', name: 'Trà sữa trân châu', description: 'Tại chỗ', price: 35000, quantity: 3, total: 105000 }
    ]
  }
];

export default function OrderManagementPage() {
  const today = new Date().toISOString().split('T')[0];
  const [searchTerm, setSearchTerm] = useState('');
  const [fromDate, setFromDate] = useState(today);
  const [toDate, setToDate] = useState(today);
  const [employeeFilter, setEmployeeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedOrderId, setSelectedOrderId] = useState<string>(MOCK_ORDERS[0].id);
  
  // States for the detail panel form
  const [currentStatus, setCurrentStatus] = useState<'Hoàn tất' | 'Đã hủy'>(MOCK_ORDERS[0].status);
  const [currentReason, setCurrentReason] = useState(MOCK_ORDERS[0].reason || '');
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);

  const selectedOrder = MOCK_ORDERS.find(o => o.id === selectedOrderId) || MOCK_ORDERS[0];
  const isEditable = selectedOrder.status === 'Hoàn tất';
  const isSaveDisabled = 
    (currentStatus === selectedOrder.status && currentReason === (selectedOrder.reason || '')) ||
    (currentStatus === 'Đã hủy' && currentReason.trim() === '');

  const handleSelectOrder = (order: Order) => {
    setSelectedOrderId(order.id);
    setCurrentStatus(order.status);
    setCurrentReason(order.reason || '');
  };

  const hasFiltersChanged = 
    searchTerm !== '' || 
    fromDate !== today || 
    toDate !== today || 
    employeeFilter !== 'all' || 
    statusFilter !== 'all';

  const handleClearFilters = () => {
    setSearchTerm('');
    setFromDate(today);
    setToDate(today);
    setEmployeeFilter('all');
    setStatusFilter('all');
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN').format(amount) + 'đ';
  };

  const formatDateDisplay = (dateString: string) => {
    const [y, m, d] = dateString.split('-');
    return `${d}/${m}/${y}`;
  };

  const parseDate = (dateStr: string) => {
    const [d, m, y] = dateStr.split('/');
    return new Date(`${y}-${m}-${d}`);
  };

  const filteredOrders = MOCK_ORDERS.filter(order => {
    // Search
    const matchSearch = order.id.toLowerCase().includes(searchTerm.toLowerCase()) || 
                        order.employee.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Date
    const orderDate = parseDate(order.date);
    const from = new Date(fromDate);
    from.setHours(0, 0, 0, 0);
    const to = new Date(toDate);
    to.setHours(23, 59, 59, 999);
    const matchDate = orderDate >= from && orderDate <= to;
    
    // Employee
    const matchEmployee = employeeFilter === 'all' || 
      (employeeFilter === 'nguyenvana' && order.employee === 'Nguyễn Văn A');

    // Status
    const matchStatus = statusFilter === 'all' || 
      (statusFilter === 'completed' && order.status === 'Hoàn tất') ||
      (statusFilter === 'cancelled' && order.status === 'Đã hủy');

    return matchSearch && matchDate && matchEmployee && matchStatus;
  });

  const handleExportExcel = () => {
    const exportData = filteredOrders.map(order => ({
      'Mã Đơn': order.id.split('_')[0],
      'Ngày': order.date,
      'Giờ vào': order.timeIn,
      'Giờ ra': order.timeOut,
      'Nhân viên': order.employee,
      'Phương thức thanh toán': order.paymentMethod || '--',
      'Tổng tiền': order.totalAmount,
      'Trạng thái': order.status,
      'Lý do hủy': order.reason || '',
      'Tiền khách trả': order.customerPaid,
      'Tiền thừa': order.change,
      'Danh sách sản phẩm': order.products.map(p => `${p.name} (x${p.quantity})`).join(', ')
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    
    // Auto-size columns slightly
    const wscols = [
      {wch: 15}, {wch: 12}, {wch: 10}, {wch: 10}, 
      {wch: 20}, {wch: 25}, {wch: 15}, {wch: 15}, 
      {wch: 25}, {wch: 15}, {wch: 15}, {wch: 50}
    ];
    worksheet['!cols'] = wscols;

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'DonHang');
    
    XLSX.writeFile(workbook, `DanhSachDonHang_${new Date().toISOString().slice(0, 10)}.xlsx`);
  };

  return (
    <div className="orders-page-container">
      {/* Header */}
      <div className="orders-page-header">
        <h1 className="orders-page-title">ĐƠN HÀNG</h1>
        <button className="btn-export-excel" onClick={() => setIsExportModalOpen(true)}>
          Xuất Excel <img src={iconExportExcel} alt="Export Excel" className="btn-icon-img" />
        </button>
      </div>

      {/* Main Split Layout */}
      <div className="orders-split-layout">
        
        {/* Left Column: Filters + List */}
        <div className="orders-left-column">
          {/* Filter Bar */}
          <div className="orders-filter-bar">
            <div className="orders-filter-row">
              <div className="orders-search-wrapper">
                <Search className="orders-search-icon" size={16} />
                <input 
                  type="text" 
                  className="orders-search-input" 
                  placeholder="Tìm kiếm..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              
              <div className="orders-date-group">
                <span>Từ:</span>
                <input 
                  type="date" 
                  className="orders-date-input" 
                  value={fromDate}
                  max={toDate || today}
                  onChange={(e) => setFromDate(e.target.value)}
                />
              </div>
              
              <div className="orders-date-group">
                <span>Đến:</span>
                <input 
                  type="date" 
                  className="orders-date-input" 
                  value={toDate}
                  max={today}
                  onChange={(e) => {
                    const newToDate = e.target.value;
                    setToDate(newToDate);
                    if (fromDate && newToDate && fromDate > newToDate) {
                      setFromDate(newToDate);
                    }
                  }}
                />
              </div>
            </div>

            <div className="orders-filter-row">
              <select 
                className="orders-filter-select" 
                style={{ flex: 1 }}
                value={employeeFilter}
                onChange={(e) => setEmployeeFilter(e.target.value)}
              >
                <option value="all">Tất cả nhân viên</option>
                <option value="nguyenvana">Nguyễn Văn A</option>
              </select>

              <select 
                className="orders-filter-select" 
                style={{ flex: 1 }}
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="all">Tất cả trạng thái</option>
                <option value="completed">Hoàn tất</option>
                <option value="cancelled">Đã hủy</option>
              </select>

              <button 
                className="btn-clear-filter"
                onClick={handleClearFilters}
                disabled={!hasFiltersChanged}
              >
                Xóa bộ lọc
              </button>
            </div>
          </div>

          {/* Left Panel - List */}
          <div className="orders-list-panel">
          <table className="orders-table">
            <thead>
              <tr>
                <th style={{ width: '15%' }}>Mã Đơn</th>
                <th style={{ width: '25%' }}>Thời Gian</th>
                <th style={{ width: '25%' }}>Nhân Viên</th>
                <th style={{ width: '20%' }}>Tổng tiền</th>
                <th style={{ width: '15%', textAlign: 'center' }}>Trạng Thái</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.length > 0 ? (
                filteredOrders.map(order => {
                  const isSelected = order.id === selectedOrderId;
                return (
                  <tr 
                    key={order.id} 
                    className={isSelected ? 'selected' : ''}
                    onClick={() => handleSelectOrder(order)}
                  >
                    <td className="order-id-text">{order.id.split('_')[0]}</td>
                    <td>
                      <div>{order.date}</div>
                      <div className="order-time-text">{order.timeIn}</div>
                    </td>
                    <td style={{ fontWeight: 500 }}>{order.employee}</td>
                    <td style={{ fontWeight: 600 }}>{formatCurrency(order.totalAmount)}</td>
                    <td style={{ textAlign: 'center' }}>
                      <span className={`order-status-badge ${order.status === 'Hoàn tất' ? 'status-completed' : 'status-cancelled'}`}>
                        {order.status}
                      </span>
                    </td>
                  </tr>
                );
              })) : (
                <tr>
                  <td colSpan={5} style={{ textAlign: 'center', padding: '20px', color: '#666' }}>
                    Không tìm thấy đơn hàng nào phù hợp với bộ lọc
                  </td>
                </tr>
              )}
            </tbody>
          </table>
          </div>
        </div>

        {/* Right Panel - Detail */}
        {filteredOrders.length > 0 ? (
        <div className="order-detail-panel">
          <div className="order-detail-header">
            <div className="order-detail-title-wrapper">
              <div className="order-detail-icon">
                <FileText size={24} />
              </div>
              <h2 className="order-detail-title">{selectedOrder.id.split('_')[0]}</h2>
            </div>
            {isEditable && (
              <button 
                className="btn-save-order"
                disabled={isSaveDisabled}
              >
                Lưu
              </button>
            )}
          </div>

          <div className="order-detail-body">
            <div className="order-info-wrapper">
              {/* Grid Info */}
            <div className="order-info-grid">
              <div className="order-info-item">
                <span className="order-info-label">Ngày:</span>
                <span className="order-info-value">{selectedOrder.date}</span>
              </div>
              <div className="order-info-item">
                <span className="order-info-label">Nhân viên:</span>
                <span className="order-info-value">{selectedOrder.employee}</span>
              </div>
              <div className="order-info-item">
                <span className="order-info-label">Giờ vào:</span>
                <span className="order-info-value">{selectedOrder.timeIn}</span>
              </div>
              <div className="order-info-item">
                <span className="order-info-label">Phương thức thanh toán:</span>
                <span className="order-info-value">{selectedOrder.paymentMethod || '--'}</span>
              </div>
            </div>

            {/* Status & Reason */}
            <div className="order-status-group">
              <span className="order-info-label">Trạng thái:</span>
              <div className="radio-group">
                <label className="radio-label">
                  <input 
                    type="radio" 
                    name="orderStatus" 
                    value="Hoàn tất" 
                    checked={currentStatus === 'Hoàn tất'}
                    onChange={() => setCurrentStatus('Hoàn tất')}
                    style={{ accentColor: '#256e05', cursor: isEditable ? 'pointer' : 'default' }}
                    disabled={!isEditable}
                  />
                  Hoàn Tất
                </label>
                <label className="radio-label">
                  <input 
                    type="radio" 
                    name="orderStatus" 
                    value="Đã hủy" 
                    checked={currentStatus === 'Đã hủy'}
                    onChange={() => setCurrentStatus('Đã hủy')}
                    style={{ accentColor: '#256e05', cursor: isEditable ? 'pointer' : 'default' }}
                    disabled={!isEditable}
                  />
                  Đã hủy
                </label>
              </div>
            </div>

            {currentStatus === 'Đã hủy' && (
              <div className="order-status-group">
                <span className="order-info-label">Lý do:</span>
                <input 
                  type="text" 
                  className="reason-input"
                  value={currentReason}
                  onChange={(e) => setCurrentReason(e.target.value)}
                  disabled={!isEditable}
                />
              </div>
            )}
            </div>

            {/* Products Table */}
            <div className="order-products-section">
              <div className="order-products-title">Danh sách sản phẩm</div>
              <div className="order-products-table-wrapper">
                <table className="order-products-table">
                  <thead>
                    <tr>
                      <th style={{ width: '40%' }}>SẢN PHẨM</th>
                      <th style={{ width: '25%', textAlign: 'right' }}>GIÁ</th>
                      <th style={{ width: '10%', textAlign: 'center' }}>SL</th>
                      <th style={{ width: '25%', textAlign: 'right' }}>TỔNG</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedOrder.products.map(p => (
                      <tr key={p.id}>
                        <td>
                          <div className="product-item-name">{p.name}</div>
                          <div className="product-item-desc">{p.description}</div>
                        </td>
                        <td style={{ textAlign: 'right' }}>{formatCurrency(p.price)}</td>
                        <td style={{ textAlign: 'center' }}>
                          {p.quantity < 10 ? `0${p.quantity}` : p.quantity}
                        </td>
                        <td style={{ textAlign: 'right', fontWeight: 600 }}>{formatCurrency(p.total)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Footer Summary */}
          <div className="order-detail-footer">
            <div className="order-summary-row total">
              <span>Tổng cộng đơn</span>
              <span className="value">{formatCurrency(selectedOrder.totalAmount)}</span>
            </div>
            <div className="order-summary-row small">
              <span>Tiền khách trả</span>
              <span>{formatCurrency(selectedOrder.customerPaid)}</span>
            </div>
            <div className="order-summary-row small">
              <span>Tiền thừa</span>
              <span>{formatCurrency(selectedOrder.change)}</span>
            </div>
          </div>
        </div>
        ) : (
          <div className="order-detail-panel empty-detail">
            <FileText size={64} className="empty-detail-icon" />
            <p className="empty-detail-text">Không có đơn hàng nào để hiển thị chi tiết</p>
          </div>
        )}

      </div>

      {/* Export Modal */}
      {isExportModalOpen && (
        <div className="export-modal-overlay">
          <div className="export-modal">
            <h3 className="export-modal-title">Xác nhận xuất file Excel</h3>
            <div className="export-modal-content">
              <p><strong>Thời gian:</strong> {fromDate === toDate ? `Ngày ${formatDateDisplay(fromDate)}` : `Từ ${formatDateDisplay(fromDate)} đến ${formatDateDisplay(toDate)}`}</p>
              <p><strong>Nhân viên:</strong> {employeeFilter === 'all' ? 'Tất cả nhân viên' : (employeeFilter === 'nguyenvana' ? 'Nguyễn Văn A' : employeeFilter)}</p>
              <p><strong>Trạng thái:</strong> {statusFilter === 'all' ? 'Tất cả trạng thái' : (statusFilter === 'completed' ? 'Hoàn tất' : 'Đã hủy')}</p>
              <p><strong>Tổng số đơn hàng:</strong> {filteredOrders.length}</p>
              {filteredOrders.length === 0 && (
                <p style={{ color: '#dc3545', marginTop: '10px' }}>* Không có dữ liệu để xuất file.</p>
              )}
            </div>
            <div className="export-modal-actions">
              <button className="btn-cancel-export" onClick={() => setIsExportModalOpen(false)}>Hủy</button>
              <button 
                className="btn-confirm-export" 
                onClick={() => {
                  handleExportExcel();
                  setIsExportModalOpen(false);
                }}
                disabled={filteredOrders.length === 0}
              >
                Xác nhận
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
