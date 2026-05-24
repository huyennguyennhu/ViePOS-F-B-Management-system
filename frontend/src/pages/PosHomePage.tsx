import { useState } from 'react';
import { Calendar, DollarSign, FileText, Package, ChevronDown, X } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import './PosHomePage.css';

const typeData = [
  { name: 'Cả ngày', value: 45, color: '#2b6a0f' },
  { name: '4H', value: 35, color: '#4ade80' },
  { name: 'Mang đi', value: 20, color: '#86efac' },
];

const paymentData = [
  { name: 'Tiền Mặt', value: 35, color: '#4ade80' },
  { name: 'Chuyển Khoản', value: 65, color: '#2b6a0f' },
];

const recentOrders = [
  { 
    id: 'ORD022', date: '19/05/2026', time: '19:04', amount: '70.000đ', status: 'Hoàn tất',
    fullTime: '19/05/2026 - 19:04:32', payment: 'Tiền mặt', card: '#08',
    products: [
      { name: 'Trà Đào', type: 'Tại chỗ 4 giờ', price: '35.000đ', qty: '01', total: '35.000đ' },
      { name: 'Trà Trái Cây', type: 'Tại chỗ 4 giờ', price: '35.000đ', qty: '01', total: '35.000đ' }
    ]
  },
  { 
    id: 'ORD023', date: '19/05/2026', time: '19:30', amount: '120.000đ', status: 'Hoàn tất',
    fullTime: '19/05/2026 - 19:30:15', payment: 'Chuyển khoản', card: '#12',
    products: [
      { name: 'Cà phê sữa', type: 'Mang đi', price: '25.000đ', qty: '02', total: '50.000đ' },
      { name: 'Bạc xỉu', type: 'Mang đi', price: '35.000đ', qty: '02', total: '70.000đ' }
    ]
  },
];

// Custom Label for Pie Chart (floating circles)
const renderCustomizedLabel = ({ cx, cy, midAngle, outerRadius, percent }: any) => {
  const RADIAN = Math.PI / 180;
  // Đặt label đè lên vòng ngoài của biểu đồ
  const radius = outerRadius; 
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);

  return (
    <g>
      <circle cx={x} cy={y} r={14} fill="white" stroke="#e0e0e0" strokeWidth={1} />
      <text x={x} y={y} fill="#306B0E" textAnchor="middle" dominantBaseline="central" fontSize="9" fontWeight="bold">
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    </g>
  );
};

export default function PosHomePage() {
  const [timeFilter, setTimeFilter] = useState('today');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<any>(null);

  // Lấy chuỗi ngày hôm nay định dạng YYYY-MM-DD
  const todayStr = new Date().toISOString().split('T')[0];

  return (
    <div className="pos-home-container">
      <div className="pos-home-header-fixed">
        <h2 className="pos-home-title">Trang Chủ</h2>

        {/* Time Filter Bar */}
        <div className="home-filter-container">
          <div className="time-filter-wrapper">
            <Calendar size={18} color="#3b9016" />
            <select 
              value={timeFilter} 
              onChange={(e) => {
                const val = e.target.value;
                setTimeFilter(val);
                if (val === 'custom') {
                  setStartDate(todayStr);
                  setEndDate(todayStr);
                }
              }}
              className="time-filter-select"
            >
              <option value="today">Hôm nay</option>
              <option value="yesterday">Hôm qua</option>
              <option value="week">Tuần này</option>
              <option value="month">Tháng này</option>
              <option value="custom">Tùy chỉnh khoảng ngày...</option>
            </select>
            <ChevronDown size={16} color="#666" style={{ pointerEvents: 'none' }} />
          </div>
          
          {timeFilter === 'custom' && (
          <div className="pos-custom-date-range">
            <div className="pos-date-input-wrapper">
              <span className="pos-date-label">Từ</span>
              <input 
                type="date" 
                value={startDate} 
                onChange={e => setStartDate(e.target.value)} 
                max={endDate || todayStr}
                className="pos-date-input" 
                onClick={(e) => e.currentTarget.showPicker && e.currentTarget.showPicker()}
                onKeyDown={(e) => e.preventDefault()}
              />
            </div>
            <div className="pos-date-input-wrapper">
              <span className="pos-date-label">Đến</span>
              <input 
                type="date" 
                value={endDate} 
                onChange={e => {
                  setEndDate(e.target.value);
                  if (startDate && e.target.value < startDate) {
                    setStartDate(e.target.value);
                  }
                }} 
                max={todayStr}
                className="pos-date-input" 
                onClick={(e) => e.currentTarget.showPicker && e.currentTarget.showPicker()}
                onKeyDown={(e) => e.preventDefault()}
              />
            </div>
          </div>
        )}
        </div>
      </div>

      <div className="pos-home-content-scroll custom-scrollbar">
        {/* Summary Cards */}
      <div className="home-summary-cards">
        <div className="summary-card revenue">
          <div className="summary-card-top-border"></div>
          <div className="summary-icon-row">
            <div className="summary-icon-circle"><DollarSign size={10} strokeWidth={3} /></div>
            <div className="summary-title">Tổng Doanh Thu</div>
          </div>
          <div className="summary-value">1.735.000đ</div>
          <div className="summary-badge-row">
            <span className="summary-badge positive">+2,34%</span>
            <span className="summary-compare-text">So với kỳ trước</span>
          </div>
        </div>

        <div className="summary-card orders">
          <div className="summary-card-top-border"></div>
          <div className="summary-icon-row">
            <div className="summary-icon-circle"><FileText size={10} strokeWidth={3} /></div>
            <div className="summary-title">Tổng Đơn Hàng</div>
          </div>
          <div className="summary-value">32 đơn</div>
          <div className="summary-badge-row">
            <span className="summary-badge negative">-2,34%</span>
            <span className="summary-compare-text">So với kỳ trước</span>
          </div>
        </div>

        <div className="summary-card products">
          <div className="summary-card-top-border"></div>
          <div className="summary-icon-row">
            <div className="summary-icon-circle"><Package size={10} strokeWidth={3} /></div>
            <div className="summary-title">Tổng Sản Phẩm</div>
          </div>
          <div className="summary-value">34</div>
          <div className="summary-badge-row">
            <span className="summary-badge positive">+2,34%</span>
            <span className="summary-compare-text">So với kỳ trước</span>
          </div>
        </div>
      </div>

      {/* Chart 1: Cơ Cấu Theo Loại */}
      <div className="home-chart-card">
        <h3 className="chart-title">Cơ Cấu Theo Loại</h3>
        <div className="chart-content-col">
          <div className="pos-type-chart-wrapper">
            <PieChart width={140} height={140}>
              <Pie
                data={typeData}
                cx="50%"
                cy="50%"
                innerRadius={35}
                outerRadius={55}
                dataKey="value"
                stroke="none"
                label={renderCustomizedLabel}
                labelLine={false}
              >
                {typeData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
            </PieChart>
          </div>
          
          <div className="chart-legend">
            <div className="legend-item">
              <div className="legend-dot" style={{ backgroundColor: '#2b6a0f' }}></div>
              <div className="legend-name">Cả ngày</div>
              <div className="legend-sub"> • 15 đơn • 1.050.000đ</div>
              <div className="legend-percent">45%</div>
            </div>
            <div className="legend-item">
              <div className="legend-dot" style={{ backgroundColor: '#4ade80' }}></div>
              <div className="legend-name">4H</div>
              <div className="legend-sub"> • 11 đơn • 535.000đ</div>
              <div className="legend-percent">35%</div>
            </div>
            <div className="legend-item">
              <div className="legend-dot" style={{ backgroundColor: '#86efac' }}></div>
              <div className="legend-name">Mang đi</div>
              <div className="legend-sub"> • 6 đơn • 150.000đ</div>
              <div className="legend-percent">20%</div>
            </div>
          </div>
        </div>
      </div>

      {/* Chart 2: Cơ Cấu Theo Phương Thức Thanh Toán */}
      <div className="home-chart-card">
        <h3 className="chart-title">Cơ Cấu Theo Phương Thức Thanh Toán</h3>
        <div className="payment-chart-container">
          <ResponsiveContainer width="100%" height={180}>
            <PieChart>
              <Pie
                data={paymentData}
                cx="50%"
                cy="50%"
                innerRadius={38}
                outerRadius={62}
                dataKey="value"
                stroke="none"
                labelLine={false}
                label={({ cx = 0, cy = 0, midAngle = 0, outerRadius = 0, name, value, index }: any) => {
                  if (midAngle === undefined || cx === undefined || cy === undefined || outerRadius === undefined) return null;
                  const RADIAN = Math.PI / 180;
                  // Điểm đầu đường kẻ: cạnh ngoài của slice
                  const sin = Math.sin(-midAngle * RADIAN);
                  const cos = Math.cos(-midAngle * RADIAN);
                  const sx = cx + (outerRadius + 6) * cos;
                  const sy = cy + (outerRadius + 6) * sin;
                  // Điểm giữa: ra thêm 1 đoạn
                  const mx = cx + (outerRadius + 20) * cos;
                  const my = cy + (outerRadius + 20) * sin;
                  // Điểm cuối: kéo ngang về phía legend
                  const ex = mx + (cos >= 0 ? 1 : -1) * 22;
                  const ey = my;
                  const textAnchor = cos >= 0 ? 'start' : 'end';
                  const color = paymentData[index].color;
                  const sub = index === 0 ? '11 đơn | 535.000đ' : '21 đơn | 1.200.000đ';

                  return (
                    <g>
                      {/* Đường kẻ từ slice → ra ngoài → ngang sang label */}
                      <path d={`M${sx},${sy}L${mx},${my}L${ex},${ey}`} stroke={color} fill="none" strokeWidth={1.5} />
                      {/* Dấu chấm tại điểm ngoài */}
                      <circle cx={ex} cy={ey} r={2} fill={color} />
                      {/* Tên phương thức */}
                      <text x={ex + (cos >= 0 ? 4 : -4)} y={ey - 6} textAnchor={textAnchor} fill={color} fontSize={12} fontWeight={700}>{name}</text>
                      {/* Thông tin phụ */}
                      <text x={ex + (cos >= 0 ? 4 : -4)} y={ey + 8} textAnchor={textAnchor} fill="#888" fontSize={10}>{sub}</text>
                      {/* Phần trăm trên biểu đồ - hình tròn */}
                      {(() => {
                        const px = cx + (outerRadius - 18) * cos;
                        const py = cy + (outerRadius - 18) * sin;
                        return (
                          <g>
                            <circle cx={px} cy={py} r={13} fill="white" stroke={color} strokeWidth={1.2} />
                            <text
                              x={px} y={py}
                              textAnchor="middle"
                              dominantBaseline="central"
                              fill={color}
                              fontSize={9}
                              fontWeight={700}
                            >{value}%</text>
                          </g>
                        );
                      })()}
                    </g>
                  );
                }}
              >
                {paymentData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Table List */}
      <div className="home-table-card">
        <div className="home-table-header">
          <h3 className="home-table-title">Danh Sách Đơn Hàng</h3>
          <div className="home-table-count">Kết quả: <span>32 đơn hàng</span></div>
        </div>
        <table className="home-table">
          <thead>
            <tr>
              <th className="home-th home-th-id">Mã Đơn</th>
              <th className="home-th home-th-time">Thời Gian</th>
              <th className="home-th home-th-amount">Tổng Tiền</th>
              <th className="home-th home-th-status">Trạng Thái</th>
            </tr>
          </thead>
          <tbody>
            {recentOrders.map((order, index) => (
              <tr key={index} onClick={() => setSelectedOrder(order)} className="clickable-row">
                <td className="home-td home-td-id">{order.id}</td>
                <td className="home-td home-td-time">
                  <div className="home-td-time-main">{order.date}</div>
                  <div className="home-td-time-sub">{order.time}</div>
                </td>
                <td className="home-td home-td-amount">{order.amount}</td>
                <td className="home-td home-td-status">
                  <span className="home-status-badge">{order.status}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Order Detail Modal */}
      {selectedOrder && (
        <div className="pos-modal-overlay" onClick={() => setSelectedOrder(null)}>
          <div className="pos-modal-content" onClick={e => e.stopPropagation()}>
            <div className="pos-modal-header">
              <h2 className="pos-modal-title">{selectedOrder.id}</h2>
              <button className="pos-modal-close" onClick={() => setSelectedOrder(null)}>
                <X size={24} color="#111" />
              </button>
            </div>
            
            <div className="pos-modal-body">
              <div className="pos-modal-info-grid">
                <div className="info-label">Ngày giờ:</div>
                <div className="info-value">{selectedOrder.fullTime}</div>
                
                <div className="info-label">Trạng thái:</div>
                <div className="info-value">
                  <span className="pos-modal-status-badge">{selectedOrder.status}</span>
                </div>
                
                <div className="info-label">Thanh toán:</div>
                <div className="info-value">{selectedOrder.payment}</div>
                
                <div className="info-label">Số thẻ:</div>
                <div className="info-value">{selectedOrder.card}</div>
              </div>
              
              <div className="pos-modal-products-section">
                <h3 className="pos-modal-products-title">Danh sách sản phẩm</h3>
                <div className="pos-modal-products-table">
                  <div className="products-header-row">
                    <div className="col-name">SẢN PHẨM</div>
                    <div className="col-price">GIÁ</div>
                    <div className="col-qty">SL</div>
                    <div className="col-total">TỔNG</div>
                  </div>
                  <div className="products-list">
                    {selectedOrder.products?.map((p: any, i: number) => (
                      <div className="product-row" key={i}>
                        <div className="col-name">
                          <div className="p-name">{p.name}</div>
                          <div className="p-type">{p.type}</div>
                        </div>
                        <div className="col-price">{p.price}</div>
                        <div className="col-qty">{p.qty}</div>
                        <div className="col-total">{p.total}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
            
            <div className="pos-modal-footer">
              <div className="footer-label">Tổng cộng đơn</div>
              <div className="footer-amount">{selectedOrder.amount}</div>
            </div>
          </div>
        </div>
      )}

      </div>
    </div>
  );
}
