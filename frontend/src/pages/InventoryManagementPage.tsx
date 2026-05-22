import { useState } from 'react';
import { Search } from 'lucide-react';
import './InventoryManagementPage.css';

const inventoryData = [
  { id: 1, sku: 'SKU - RJSBDN', name: 'Cà phê sữa', category: 'Cà Phê', stock: 15, warningLimit: 10, status: 'An toàn' },
  { id: 2, sku: 'SKU - BJKSBS', name: 'Trà ổi hồng', category: 'Trà', stock: 6, warningLimit: 10, status: 'Cảnh báo' },
  { id: 3, sku: 'SKU - MDBJND', name: 'Bánh que', category: 'Ăn Vặt', stock: 0, warningLimit: 10, status: 'Hết hàng' },
  { id: 4, sku: 'SKU - RJSBDN2', name: 'Cà phê sữa', category: 'Cà Phê', stock: 15, warningLimit: 10, status: 'An toàn' },
  { id: 5, sku: 'SKU - RJSBDN3', name: 'Cà phê sữa', category: 'Cà Phê', stock: 15, warningLimit: 10, status: 'An toàn' },
  { id: 6, sku: 'SKU - RJSBDN4', name: 'Cà phê sữa', category: 'Cà Phê', stock: 15, warningLimit: 10, status: 'An toàn' },
  { id: 7, sku: 'SKU - RJSBDN5', name: 'Cà phê sữa', category: 'Cà Phê', stock: 15, warningLimit: 10, status: 'An toàn' },
];

export default function InventoryManagementPage() {
  const [searchTerm, setSearchTerm] = useState('');
  
  return (
    <div className="inventory-container">
      <div className="sticky-header">
        <div className="header-top-row">
          <h1 className="inventory-title">QUẢN LÝ TỒN KHO</h1>
          <div className="header-actions">
            <button className="btn-export">- Xuất kho</button>
            <button className="btn-import">+ Nhập kho</button>
          </div>
        </div>

        {/* Metrics Cards */}
        <div className="inventory-metrics-grid">
          <div className="metric-card">
            <div className="metric-icon-bg default-bg">
              <span className="metric-icon gray-text">📦</span>
            </div>
            <div className="metric-content">
              <span className="metric-title">Tổng sản phẩm</span>
              <div className="metric-value dark-text">17</div>
            </div>
          </div>
          <div className="metric-card">
            <div className="metric-icon-bg green-bg">
              <span className="metric-icon green-text">✓</span>
            </div>
            <div className="metric-content">
              <span className="metric-title">Tồn kho an toàn</span>
              <div className="metric-value green-text">10</div>
            </div>
          </div>
          <div className="metric-card">
            <div className="metric-icon-bg yellow-bg">
              <span className="metric-icon yellow-text">!</span>
            </div>
            <div className="metric-content">
              <span className="metric-title">Cảnh báo tồn kho</span>
              <div className="metric-value yellow-text">5</div>
            </div>
          </div>
          <div className="metric-card">
            <div className="metric-icon-bg red-bg">
              <span className="metric-icon red-text">✕</span>
            </div>
            <div className="metric-content">
              <span className="metric-title">Đã hết hàng</span>
              <div className="metric-value red-text">2</div>
            </div>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="inventory-filter-bar">
          <div className="search-wrapper">
            <Search size={16} className="search-icon" />
            <input 
              type="text" 
              placeholder="Tìm kiếm theo tên sản phẩm, SKU" 
              className="search-input"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="filter-select-wrapper">
            <select className="filter-select">
              <option>Tất cả danh mục</option>
              <option>Cà Phê</option>
              <option>Trà</option>
              <option>Ăn Vặt</option>
            </select>
          </div>
          <div className="filter-select-wrapper">
            <select className="filter-select">
              <option>Tất cả trạng thái kho</option>
              <option>An toàn</option>
              <option>Cảnh báo</option>
              <option>Hết hàng</option>
            </select>
          </div>
          
          <div className="results-count">
            Kết quả: <span className="count-number">17 sản phẩm</span>
          </div>
        </div>
      </div>

      {/* Table Container */}
      <div className="inventory-table-container">
        <table className="inventory-table">
          <thead>
            <tr>
              <th>SKU</th>
              <th>Sản Phẩm</th>
              <th>Danh Mục</th>
              <th className="text-center">Tồn Kho</th>
              <th className="text-center">Ngưỡng Cảnh Báo</th>
              <th>Trạng Thái</th>
              <th>Hành Động</th>
            </tr>
          </thead>
          <tbody>
            {inventoryData.map((item) => (
              <tr key={item.id}>
                <td className="sku-text">{item.sku}</td>
                <td className="product-name">{item.name}</td>
                <td>{item.category}</td>
                <td className="text-center">{item.stock}</td>
                <td className="text-center">{item.warningLimit}</td>
                <td>
                  <span className={`status-badge ${
                    item.status === 'An toàn' ? 'safe' : 
                    item.status === 'Cảnh báo' ? 'warning' : 'danger'
                  }`}>
                    {item.status}
                  </span>
                </td>
                <td>
                  <button className="btn-add-stock">+ Nhập thêm</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
