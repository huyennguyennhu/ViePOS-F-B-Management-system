import { useState, useEffect } from 'react';
import { Search, Calculator, X, Minus, Plus, ChevronLeft, Edit2, Trash2, Camera } from 'lucide-react';
import { productAPI, cardAPI } from '../services/api';
import arrowWhite from '../../assets/icon/arrow_white.png';
import './PosSalesPage.css';

interface Category {
  id: number;
  name: string;
}

interface Product {
  id: number;
  sku: string;
  name: string;
  imageUrl: string | null;
  status: string;
  category: Category;
}

export interface CartItem {
  id: string; // unique id for each item in cart
  product: Product;
  serveType: 'takeaway' | 'dine_in';
  duration: '4h' | 'all_day';
  quantity: number;
  note: string;
  price: number;
}

export interface TempEditItem {
  id: string;
  product: Product;
  serveType: 'takeaway' | 'dine_in';
  duration: '4h' | 'all_day';
  note: string;
}

export interface BackendCard {
  id: number;
  cardNumber: string;
  status: string;
}

const INITIAL_PRODUCTS: Product[] = [
  { id: 1, sku: 'CF-DEN-01', name: 'Cà phê đen', imageUrl: null, status: 'Đang bán', category: { id: 1, name: 'Cà phê' } },
  { id: 2, sku: 'CF-SUA-02', name: 'Cà phê sữa', imageUrl: null, status: 'Đang bán', category: { id: 1, name: 'Cà phê' } },
  { id: 3, sku: 'TS-DAC-01', name: 'Trà sữa đặc sản', imageUrl: null, status: 'Đang bán', category: { id: 2, name: 'Trà sữa' } },
  { id: 4, sku: 'TS-TRU-02', name: 'Trà sữa truyền thống', imageUrl: null, status: 'Đang bán', category: { id: 2, name: 'Trà sữa' } },
  { id: 5, sku: 'NE-DEP-01', name: 'Đẹp da', imageUrl: null, status: 'Đang bán', category: { id: 3, name: 'Nước ép' } },
  { id: 6, sku: 'NE-DAN-02', name: 'Đẹp dáng', imageUrl: null, status: 'Đang bán', category: { id: 3, name: 'Nước ép' } },
  { id: 7, sku: 'TR-NHT-01', name: 'Trà trái cây nhiệt đới', imageUrl: null, status: 'Đang bán', category: { id: 4, name: 'Trà' } },
  { id: 8, sku: 'TR-MAN-02', name: 'Trà mãng cầu', imageUrl: null, status: 'Đang bán', category: { id: 4, name: 'Trà' } },
  { id: 9, sku: 'TR-OIH-03', name: 'Trà ổi hồng', imageUrl: null, status: 'Đang bán', category: { id: 4, name: 'Trà' } },
  { id: 10, sku: 'TR-HIB-04', name: 'Trà Hibiscus', imageUrl: null, status: 'Đang bán', category: { id: 4, name: 'Trà' } },
  { id: 11, sku: 'TR-XOA-05', name: 'Trà xoài chanh leo', imageUrl: null, status: 'Đang bán', category: { id: 4, name: 'Trà' } },
  { id: 12, sku: 'TR-DET-06', name: 'Trà detox nóng', imageUrl: null, status: 'Đang bán', category: { id: 4, name: 'Trà' } },
  { id: 13, sku: 'AV-MILY-01', name: 'Mì ly', imageUrl: null, status: 'Đang bán', category: { id: 5, name: 'Ăn vặt' } },
  { id: 14, sku: 'AV-BGAU-02', name: 'Bánh gấu', imageUrl: null, status: 'Đang bán', category: { id: 5, name: 'Ăn vặt' } },
  { id: 15, sku: 'AV-BQUE-03', name: 'Bánh que', imageUrl: null, status: 'Đang bán', category: { id: 5, name: 'Ăn vặt' } },
  { id: 16, sku: 'AV-BTM-04', name: 'Bánh tai mèo', imageUrl: null, status: 'Đang bán', category: { id: 5, name: 'Ăn vặt' } },
  { id: 17, sku: 'AV-BDT-05', name: 'Bánh đồng tiền', imageUrl: null, status: 'Đang bán', category: { id: 5, name: 'Ăn vặt' } },
];

const INITIAL_CATEGORIES = ['Tất cả', 'Cà phê', 'Trà sữa', 'Nước ép', 'Trà', 'Ăn vặt'];

export default function PosSalesPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Tất cả');
  const [products, setProducts] = useState<Product[]>(INITIAL_PRODUCTS);
  const [categories, setCategories] = useState<string[]>(INITIAL_CATEGORIES);
  const [loading, setLoading] = useState(false);

  // States cho Giỏ hàng (Đơn hàng)
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const discountPercent = 0;
  const [isEditAllOpen, setIsEditAllOpen] = useState(false);
  const [editAllItems, setEditAllItems] = useState<TempEditItem[]>([]);

  // States cho Thanh toán
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'transfer'>('cash');
  const [cashInput, setCashInput] = useState('0');
  const [paymentImage, setPaymentImage] = useState<string | null>(null);

  // States cho Chọn thẻ
  const [isCardSelectionOpen, setIsCardSelectionOpen] = useState(false);
  const [freeCards, setFreeCards] = useState<BackendCard[]>([]);
  const [selectedCardNumber, setSelectedCardNumber] = useState<string | null>(null);

  // State cho Popup xác nhận xóa
  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean;
    message: string;
    onConfirm: () => void;
  }>({ open: false, message: '', onConfirm: () => {} });

  // State cho Popup thông báo thành công
  const [successDialog, setSuccessDialog] = useState<{
    open: boolean;
    title: string;
    message: string;
  }>({ open: false, title: '', message: '' });

  const showConfirm = (message: string, onConfirm: () => void) => {
    setConfirmDialog({ open: true, message, onConfirm });
  };

  const closeConfirm = () => {
    setConfirmDialog(prev => ({ ...prev, open: false }));
  };

  const handleConfirmOk = () => {
    confirmDialog.onConfirm();
    closeConfirm();
  };

  // States cho Popup Chi tiết món
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [editingCartItemId, setEditingCartItemId] = useState<string | null>(null);
  const [serveType, setServeType] = useState<'takeaway' | 'dine_in'>('takeaway');
  const [duration, setDuration] = useState<'4h' | 'all_day'>('4h');
  const [quantity, setQuantity] = useState(1);
  const [note, setNote] = useState('');

  // Hàm tính giá
  const calculatePrice = () => {
    let basePrice = 0;
    if (serveType === 'takeaway') {
      basePrice = 25000;
    } else if (serveType === 'dine_in') {
      if (duration === '4h') {
        basePrice = 35000;
      } else {
        basePrice = 45000;
      }
    }
    return basePrice * quantity;
  };

  // Mở popup
  const handleProductClick = (product: Product) => {
    setSelectedProduct(product);
    setServeType('takeaway');
    setDuration('4h');
    setQuantity(1);
    setNote('');
  };

  // Đóng popup
  const closePopup = () => {
    setSelectedProduct(null);
    setEditingCartItemId(null);
  };

  // Mở popup để điều chỉnh món trong giỏ
  const handleEditCartItem = (item: CartItem) => {
    setEditingCartItemId(item.id);
    setSelectedProduct(item.product);
    setServeType(item.serveType);
    setDuration(item.duration);
    setQuantity(item.quantity);
    setNote(item.note);
  };

  // Lưu món đã điều chỉnh
  const handleSaveEditedItem = () => {
    if (!editingCartItemId) return;
    setCartItems(prev => prev.map(item => {
      if (item.id === editingCartItemId) {
        return {
          ...item,
          serveType,
          duration,
          quantity,
          note,
          price: calculatePrice()
        };
      }
      return item;
    }));
    closePopup();
  };

  // Mở popup điều chỉnh tất cả các món
  const handleOpenEditAll = () => {
    const tempItems: TempEditItem[] = [];
    cartItems.forEach((item, itemIdx) => {
      // Split each item by its quantity
      for (let i = 0; i < item.quantity; i++) {
        tempItems.push({
          id: `${item.id}_${itemIdx}_${i}`,
          product: item.product,
          serveType: item.serveType,
          duration: item.duration,
          note: item.note,
        });
      }
    });
    setEditAllItems(tempItems);
    setIsEditAllOpen(true);
  };

  // Thay đổi cấu hình của từng món trong popup chỉnh sửa hàng loạt
  const handleEditAllChange = (id: string, field: 'serveType' | 'duration', value: any) => {
    setEditAllItems(prev => prev.map(item => {
      if (item.id === id) {
        return { ...item, [field]: value };
      }
      return item;
    }));
  };

  // Lưu cấu hình chỉnh sửa hàng loạt
  const handleSaveEditAll = () => {
    const merged: CartItem[] = [];
    editAllItems.forEach(item => {
      // Find if there's an identical item in the merged array
      const existing = merged.find(m => 
        m.product.id === item.product.id && 
        m.serveType === item.serveType && 
        m.duration === item.duration && 
        m.note === item.note
      );
      
      if (existing) {
        existing.quantity += 1;
        // Recalculate price
        let basePrice = 25000;
        if (existing.serveType === 'dine_in') {
          basePrice = existing.duration === '4h' ? 35000 : 45000;
        }
        existing.price = basePrice * existing.quantity;
      } else {
        let basePrice = 25000;
        if (item.serveType === 'dine_in') {
          basePrice = item.duration === '4h' ? 35000 : 45000;
        }
        merged.push({
          id: item.id,
          product: item.product,
          serveType: item.serveType,
          duration: item.duration,
          quantity: 1,
          note: item.note,
          price: basePrice
        });
      }
    });
    
    setCartItems(merged);
    setIsEditAllOpen(false);
  };

  // Thêm vào giỏ hàng
  const handleAddToCart = (openCart: boolean) => {
    if (!selectedProduct) return;
    
    const newItem: CartItem = {
      id: Date.now().toString() + Math.random().toString(36).substring(7),
      product: selectedProduct,
      serveType,
      duration,
      quantity,
      note,
      price: calculatePrice(),
    };
    
    setCartItems(prev => [...prev, newItem]);
    closePopup();
    
    if (openCart) {
      setIsCartOpen(true);
    }
  };

  // Cập nhật số lượng trong giỏ hàng
  const updateCartItemQuantity = (id: string, delta: number) => {
    setCartItems(prev => prev.map(item => {
      if (item.id === id) {
        const newQuantity = Math.max(1, item.quantity + delta);
        // We calculate new base price because price is price * quantity in the CartItem object currently?
        // Wait, price in CartItem is basePrice * quantity when added.
        // It's better to recalculate based on serveType and duration.
        let basePrice = 0;
        if (item.serveType === 'takeaway') {
          basePrice = 25000;
        } else if (item.serveType === 'dine_in') {
          if (item.duration === '4h') {
            basePrice = 35000;
          } else {
            basePrice = 45000;
          }
        }
        return { ...item, quantity: newQuantity, price: basePrice * newQuantity };
      }
      return item;
    }));
  };

  // Xóa món khỏi giỏ hàng
  const handleRemoveCartItem = (id: string) => {
    showConfirm('Bạn có chắc muốn xóa món này khỏi đơn hàng?', () => {
      setCartItems(prev => prev.filter(item => item.id !== id));
    });
  };

  // Xóa toàn bộ đơn hàng
  const handleClearCart = () => {
    showConfirm('Bạn có chắc muốn hủy toàn bộ đơn hàng này?', () => {
      setCartItems([]);
      setIsCartOpen(false);
    });
  };

  // Hoàn tất thanh toán -> Mở màn hình chọn thẻ
  const handleCompletePayment = async () => {
    try {
      const res = await cardAPI.getFreeCards();
      setFreeCards(res.data);
    } catch (err) {
      console.error("Không thể tải danh sách thẻ trống:", err);
      // Fallback data
      setFreeCards([
        { id: 1, cardNumber: "06", status: "trống" },
        { id: 2, cardNumber: "09", status: "trống" },
        { id: 3, cardNumber: "10", status: "trống" },
        { id: 4, cardNumber: "11", status: "trống" },
        { id: 5, cardNumber: "14", status: "trống" },
        { id: 6, cardNumber: "15", status: "trống" },
        { id: 7, cardNumber: "17", status: "trống" },
        { id: 8, cardNumber: "20", status: "trống" },
        { id: 9, cardNumber: "21", status: "trống" },
        { id: 10, cardNumber: "23", status: "trống" },
      ]);
    }
    setSelectedCardNumber(null);
    setIsCardSelectionOpen(true);
    setIsCheckoutOpen(false);
  };

  // Chọn thẻ và kết thúc
  const handleSelectCardSelection = async () => {
    if (!selectedCardNumber) {
      alert('Vui lòng chọn một thẻ!');
      return;
    }

    // Check if there is any 4h duration in cart items
    const has4h = cartItems.some(item => item.serveType === 'dine_in' && item.duration === '4h');
    const duration = has4h ? '4h' : 'all_day';
    const orderId = 'ORD-' + Date.now().toString();
    const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);

    try {
      await cardAPI.startSession({
        cardNumber: selectedCardNumber,
        orderId: orderId,
        duration: duration
      });
      // Save metadata to LocalStorage for number of items
      const savedMetadata = localStorage.getItem('pos_orders_metadata');
      const metadata = savedMetadata ? JSON.parse(savedMetadata) : {};
      metadata[orderId] = {
        itemCount: totalItems
      };
      localStorage.setItem('pos_orders_metadata', JSON.stringify(metadata));
    } catch (err) {
      console.error("Lỗi khi tạo phiên thẻ:", err);
    }

    setSuccessDialog({
      open: true,
      title: 'Tạo Đơn Thành Công!',
      message: `Đơn hàng đã được thanh toán. Bắt đầu phiên thẻ số ${selectedCardNumber}.`
    });
    setCartItems([]);
    setIsCardSelectionOpen(false);
    setIsCartOpen(false);
  };

  // Bỏ qua chọn thẻ và kết thúc
  const handleSkipCardSelection = () => {
    setSuccessDialog({
      open: true,
      title: 'Tạo Đơn Thành Công!',
      message: 'Đơn hàng mang đi đã được ghi nhận và thanh toán.'
    });
    setCartItems([]);
    setIsCardSelectionOpen(false);
    setIsCartOpen(false);
  };

  // Nhấn bàn phím số
  const handleKeypadPress = (val: string) => {
    setCashInput(prev => {
      if (val === 'C') {
        return '0';
      }
      if (val === 'backspace') {
        if (prev.length <= 1) return '0';
        return prev.slice(0, -1);
      }
      if (val === '000') {
        if (prev === '0') return '0';
        return prev + '000';
      }
      if (val === '0') {
        if (prev === '0') return '0';
        return prev + '0';
      }
      if (prev === '0') return val;
      return prev + val;
    });
  };

  // Chụp hoặc tải ảnh minh chứng chuyển khoản
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPaymentImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await productAPI.getProducts();
        const data: Product[] = res.data;
        setProducts(data);
        // Extract unique category names from products
        const cats = ['Tất cả', ...Array.from(new Set(data.map(p => p.category.name)))];
        setCategories(cats);
      } catch (err) {
        console.error('Không thể tải danh sách sản phẩm:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const filteredProducts = products.filter(p => {
    const matchCategory = selectedCategory === 'Tất cả' || p.category.name === selectedCategory;
    const matchSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || p.sku.toLowerCase().includes(searchQuery.toLowerCase());
    const isActive = p.status === 'Đang bán';
    return matchCategory && matchSearch && isActive;
  });

  // Tạo chữ viết tắt từ tên sản phẩm (tối đa 2 chữ cái đầu của từ)
  const getInitials = (name: string) => {
    const words = name.trim().split(/\s+/);
    if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
    return (words[0][0] + words[1][0]).toUpperCase();
  };

  // Màu nền theo danh mục
  const getCategoryColor = (categoryName: string) => {
    const map: Record<string, string> = {
      'Cà phê': '#795548',
      'Trà sữa': '#ec407a',
      'Nước ép': '#ff7043',
      'Trà': '#4caf50',
      'Ăn vặt': '#ffa726',
    };
    return map[categoryName] || '#349409';
  };

  const tempTotal = cartItems.reduce((sum, item) => sum + item.price, 0);
  const discountAmount = (tempTotal * discountPercent) / 100;
  const finalTotal = tempTotal - discountAmount;

  const has4h = cartItems.some(item => item.serveType === 'dine_in' && item.duration === '4h');
  const hasAllDay = cartItems.some(item => item.serveType === 'dine_in' && item.duration === 'all_day');
  const isTakeawayOnly = cartItems.length > 0 && cartItems.every(item => item.serveType === 'takeaway');

  return (
    <div className="pos-sales-page">
      <div className="pos-top-section">
        {/* Header */}
        <div className="pos-header">
          <h1 className="pos-title">Bán hàng</h1>
          <div 
            className="pos-register-icon" 
            onClick={() => cartItems.length > 0 && setIsCartOpen(true)} 
            style={{ cursor: cartItems.length > 0 ? 'pointer' : 'default' }}
          >
            <Calculator size={24} color="#111" />
            {cartItems.length > 0 && (
              <span className="pos-badge">
                {cartItems.reduce((sum, item) => sum + item.quantity, 0)}
              </span>
            )}
          </div>
        </div>

        {/* Search */}
        <div className="pos-search-container">
          <div className="pos-search-box">
            <Search size={20} color="#a0a0a0" />
            <input 
              type="text" 
              placeholder="Tìm kiếm..." 
              className="pos-search-input" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <button 
                className="pos-search-clear-btn" 
                onClick={() => setSearchQuery('')}
              >
                <X size={16} color="#a0a0a0" />
              </button>
            )}
          </div>
        </div>

        {/* Categories */}
        <div className="pos-categories">
          {categories.map((cat, idx) => (
            <button 
              key={idx} 
              className={`pos-cat-btn ${cat === selectedCategory ? 'active' : ''}`}
              onClick={() => setSelectedCategory(cat)}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Product Grid */}
      <div className="pos-product-grid-scroll">
        {loading ? (
          <div className="pos-loading">Đang tải sản phẩm...</div>
        ) : filteredProducts.length === 0 ? (
          <div className="pos-empty">Không tìm thấy sản phẩm nào.</div>
        ) : (
          <div className="pos-product-grid">
            {filteredProducts.map(product => (
              <div 
                key={product.id} 
                className="pos-product-card"
                onClick={() => handleProductClick(product)}
              >
                <div 
                  className="pos-product-img"
                  style={!product.imageUrl ? { backgroundColor: getCategoryColor(product.category.name) } : {}}
                >
                  {product.imageUrl ? (
                    <img src={product.imageUrl} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    <span className="pos-product-initials">{getInitials(product.name)}</span>
                  )}
                </div>
                <div className="pos-product-info">
                  <div>{product.name}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Product Detail Bottom Sheet */}
      {selectedProduct && (
        <div className="pos-modal-overlay" onClick={closePopup}>
          <div className="pos-bottom-sheet" onClick={(e) => e.stopPropagation()}>
            {/* Header */}
            <div className="pos-sheet-header">
              <h2 className="pos-sheet-title">{editingCartItemId ? 'Điều chỉnh chi tiết món' : 'Chi tiết món'}</h2>
              <button className="pos-sheet-close" onClick={closePopup}>
                <X size={24} color="#111" />
              </button>
            </div>

            <div className="pos-sheet-body">
              {/* Product Info & Quantity */}
              <div className="pos-sheet-product-info">
                <div 
                  className="pos-sheet-img"
                  style={!selectedProduct.imageUrl ? { backgroundColor: getCategoryColor(selectedProduct.category.name) } : {}}
                >
                  {selectedProduct.imageUrl ? (
                    <img src={selectedProduct.imageUrl} alt={selectedProduct.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    <span className="pos-product-initials">{getInitials(selectedProduct.name)}</span>
                  )}
                </div>
                <div className="pos-sheet-product-details">
                  <div style={{ fontSize: '16px', fontWeight: 700, color: '#111' }}>{selectedProduct.name}</div>
                </div>
                
                {/* Quantity Control moved here */}
                <div className="pos-quantity-control">
                  <button 
                    className="pos-quantity-btn" 
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  >
                    <Minus size={14} color={quantity <= 1 ? 'rgba(255,255,255,0.5)' : '#fff'} />
                  </button>
                  <span className="pos-quantity-text">{quantity}</span>
                  <button 
                    className="pos-quantity-btn"
                    onClick={() => setQuantity(quantity + 1)}
                  >
                    <Plus size={14} color="#fff" />
                  </button>
                </div>
              </div>

              {/* Serve Type */}
              <div className="pos-sheet-section">
                <h3 className="pos-sheet-section-title">Hình thức phục vụ</h3>
                <div className="pos-sheet-options">
                  <button 
                    className={`pos-option-btn ${serveType === 'takeaway' ? 'active' : ''}`}
                    onClick={() => setServeType('takeaway')}
                  >
                    Mang đi
                  </button>
                  <button 
                    className={`pos-option-btn ${serveType === 'dine_in' ? 'active' : ''}`}
                    onClick={() => setServeType('dine_in')}
                  >
                    Tại chỗ
                  </button>
                </div>
              </div>

              {/* Duration (Only show if dine_in) */}
              {serveType === 'dine_in' && (
                <div className="pos-sheet-section">
                  <h3 className="pos-sheet-section-title">Thời gian</h3>
                  <div className="pos-sheet-options">
                    <button 
                      className={`pos-option-btn ${duration === '4h' ? 'active' : ''}`}
                      onClick={() => setDuration('4h')}
                    >
                      4 giờ
                    </button>
                    <button 
                      className={`pos-option-btn ${duration === 'all_day' ? 'active' : ''}`}
                      onClick={() => setDuration('all_day')}
                    >
                      Cả ngày
                    </button>
                  </div>
                </div>
              )}

              {/* Note */}
              <div className="pos-sheet-section">
                <h3 className="pos-sheet-section-title">Ghi chú</h3>
                <textarea 
                  className="pos-sheet-textarea" 
                  placeholder="Ghi chú thêm (ít đá, nhiều đường...)"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  rows={2}
                />
              </div>


            </div>

            {/* Footer */}
            <div className="pos-sheet-footer">
              <div className="pos-sheet-total">
                <span>Tổng tiền:</span>
                <span className="pos-sheet-price">{calculatePrice().toLocaleString('vi-VN')} đ</span>
              </div>
              <div className="pos-sheet-actions">
                {editingCartItemId ? (
                  <button className="pos-sheet-btn-solid" style={{ width: '100%' }} onClick={handleSaveEditedItem}>
                    LƯU
                  </button>
                ) : (
                  <>
                    <button className="pos-sheet-btn-outline" onClick={() => handleAddToCart(false)}>
                      MUA TIẾP
                    </button>
                    <button className="pos-sheet-btn-solid" onClick={() => handleAddToCart(true)}>
                      XONG
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Cart View Overlay */}
      {isCartOpen && (
        <div className="pos-cart-overlay">
          <div className="pos-cart-container">
            {/* Header */}
            <div className="pos-cart-header">
              <button className="pos-cart-back-btn" onClick={() => setIsCartOpen(false)}>
                <ChevronLeft size={24} color="#555" />
              </button>
              <h2 className="pos-cart-title">Đơn hàng</h2>
              <div className="pos-cart-header-actions">
                <button className="pos-cart-action-btn" onClick={handleOpenEditAll}>
                  <Edit2 size={20} color="#555" />
                </button>
                <button className="pos-cart-action-btn" onClick={handleClearCart}>
                  <X size={24} color="#d32f2f" />
                </button>
              </div>
            </div>

            {/* Cart Items */}
            <div className="pos-cart-body">
              {cartItems.length === 0 ? (
                <div className="pos-empty" style={{ marginTop: '100px' }}>Giỏ hàng đang trống.</div>
              ) : (
                <div className="pos-cart-list">
                  {cartItems.map((item) => (
                    <div key={item.id} className="pos-cart-item">
                      <div className="pos-cart-item-img">
                        {item.product.imageUrl ? (
                          <img src={item.product.imageUrl} alt={item.product.name} />
                        ) : (
                          <div style={{ backgroundColor: getCategoryColor(item.product.category.name), width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <span className="pos-product-initials" style={{ fontSize: '20px' }}>{getInitials(item.product.name)}</span>
                          </div>
                        )}
                      </div>
                      
                      <div className="pos-cart-item-details">
                        <div className="pos-cart-item-header">
                          <h4 className="pos-cart-item-name">{item.product.name}</h4>
                          <button className="pos-cart-item-edit-btn" onClick={() => handleEditCartItem(item)}>
                            <Edit2 size={16} color="#777" />
                          </button>
                        </div>
                        
                        <div className="pos-cart-item-price">{item.price.toLocaleString('vi-VN')}đ</div>
                        
                        <div className="pos-cart-item-actions">
                          <div className="pos-quantity-control">
                            <button 
                              className="pos-quantity-btn" 
                              onClick={() => updateCartItemQuantity(item.id, -1)}
                              style={{ width: '24px', height: '24px', borderRadius: '4px' }}
                            >
                              <Minus size={14} color={item.quantity <= 1 ? 'rgba(255,255,255,0.5)' : '#fff'} />
                            </button>
                            <span className="pos-quantity-text" style={{ fontSize: '14px', minWidth: '16px' }}>{item.quantity}</span>
                            <button 
                              className="pos-quantity-btn"
                              onClick={() => updateCartItemQuantity(item.id, 1)}
                              style={{ width: '24px', height: '24px', borderRadius: '4px' }}
                            >
                              <Plus size={14} color="#fff" />
                            </button>
                          </div>
                          
                          <button 
                            className="pos-cart-item-delete-btn"
                            onClick={() => handleRemoveCartItem(item.id)}
                          >
                            <Trash2 size={20} color="#d32f2f" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Cart Footer */}
            <div className="pos-cart-footer">
              <button className="pos-cart-promo-btn">
                <span>% Khuyến mãi</span>
                <img src={arrowWhite} alt="arrow" style={{ width: '10px', height: '10px', objectFit: 'contain' }} />
              </button>
              
              <div className="pos-cart-summary">
                <div className="pos-cart-summary-row">
                  <span>Tổng tạm tính</span>
                  <span style={{ fontWeight: 600 }}>{tempTotal.toLocaleString('vi-VN')}đ</span>
                </div>
                {discountPercent > 0 && (
                  <div className="pos-cart-summary-row">
                    <span>Giảm giá ({discountPercent}%)</span>
                    <span style={{ fontWeight: 600 }}>{discountAmount.toLocaleString('vi-VN')}đ</span>
                  </div>
                )}
                <div className="pos-cart-divider"></div>
                <div className="pos-cart-summary-row pos-cart-total-row">
                  <span>TỔNG</span>
                  <span className="pos-cart-final-total">{finalTotal.toLocaleString('vi-VN')}đ</span>
                </div>
              </div>
              
              <button 
                className="pos-cart-checkout-btn"
                onClick={() => {
                  setCashInput('0');
                  setPaymentImage(null);
                  setPaymentMethod('cash');
                  setIsCheckoutOpen(true);
                }}
              >
                THANH TOÁN
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Custom Confirm Dialog */}
      {confirmDialog.open && (
        <div className="pos-confirm-overlay" onClick={closeConfirm}>
          <div className="pos-confirm-box" onClick={(e) => e.stopPropagation()}>
            <p className="pos-confirm-message">{confirmDialog.message}</p>
            <div className="pos-confirm-actions">
              <button className="pos-confirm-cancel" onClick={closeConfirm}>Hủy</button>
              <button className="pos-confirm-ok" onClick={handleConfirmOk}>Xác nhận</button>
            </div>
          </div>
        </div>
      )}

      {/* Custom Success Dialog */}
      {successDialog.open && (
        <div className="pos-confirm-overlay" onClick={() => setSuccessDialog(prev => ({ ...prev, open: false }))}>
          <div className="pos-confirm-box pos-success-box" onClick={(e) => e.stopPropagation()}>
            <div className="pos-success-icon-wrapper">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM10 17L5 12L6.41 10.59L10 14.17L17.59 6.58L19 8L10 17Z" fill="#349409"/>
              </svg>
            </div>
            <h3 className="pos-success-dialog-title">{successDialog.title}</h3>
            <p className="pos-confirm-message">{successDialog.message}</p>
            <div className="pos-confirm-actions">
              <button 
                className="pos-confirm-ok" 
                style={{ width: '100%', backgroundColor: '#349409' }} 
                onClick={() => setSuccessDialog(prev => ({ ...prev, open: false }))}
              >
                Xác nhận
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Edit All Items Popup */}
      {isEditAllOpen && (
        <div className="pos-modal-overlay" onClick={() => setIsEditAllOpen(false)}>
          <div className="pos-edit-all-sheet" onClick={(e) => e.stopPropagation()}>
            {/* Header */}
            <div className="pos-edit-all-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <h2 className="pos-edit-all-title">Chi tiết các món</h2>
                <span className="pos-edit-all-badge">{editAllItems.length} món</span>
              </div>
              <button className="pos-edit-all-close" onClick={() => setIsEditAllOpen(false)}>
                <X size={24} color="#111" />
              </button>
            </div>

            {/* Body */}
            <div className="pos-edit-all-body">
              {editAllItems.map((item, index) => {
                // Calculate individual price for display
                let price = 25000;
                if (item.serveType === 'dine_in') {
                  price = item.duration === '4h' ? 35000 : 45000;
                }

                return (
                  <div key={item.id} className="pos-edit-all-item">
                    <div className="pos-edit-all-row-first">
                      <span className="pos-edit-all-name">{item.product.name}</span>
                      <span className="pos-edit-all-price">{price.toLocaleString('vi-VN')}đ</span>
                    </div>
                    
                    <div className="pos-edit-all-row-second">
                      {/* Select Dropdown */}
                      <div className="pos-edit-all-select-wrapper">
                        <select 
                          className="pos-edit-all-select"
                          value={item.serveType}
                          onChange={(e) => handleEditAllChange(item.id, 'serveType', e.target.value)}
                        >
                          <option value="takeaway">Mang đi</option>
                          <option value="dine_in">Tại chỗ</option>
                        </select>
                      </div>

                      {/* Radio buttons */}
                      <div className={`pos-edit-all-radios ${item.serveType === 'takeaway' ? 'disabled' : ''}`}>
                        <label className="pos-edit-all-radio-label">
                          <input 
                            type="radio" 
                            name={`duration_${item.id}`}
                            value="4h"
                            checked={item.duration === '4h'}
                            disabled={item.serveType === 'takeaway'}
                            onChange={() => handleEditAllChange(item.id, 'duration', '4h')}
                          />
                          <span className="pos-radio-circle"></span>
                          <span>4 giờ</span>
                        </label>

                        <label className="pos-edit-all-radio-label">
                          <input 
                            type="radio" 
                            name={`duration_${item.id}`}
                            value="all_day"
                            checked={item.duration === 'all_day'}
                            disabled={item.serveType === 'takeaway'}
                            onChange={() => handleEditAllChange(item.id, 'duration', 'all_day')}
                          />
                          <span className="pos-radio-circle"></span>
                          <span>Cả ngày</span>
                        </label>
                      </div>
                    </div>
                    
                    {index < editAllItems.length - 1 && <div className="pos-edit-all-divider"></div>}
                  </div>
                );
              })}
            </div>

            {/* Footer */}
            <div className="pos-edit-all-footer">
              <button className="pos-edit-all-save-btn" onClick={handleSaveEditAll}>
                LƯU
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Checkout Screen Overlay */}
      {isCheckoutOpen && (
        <div className="pos-checkout-overlay">
          <div className="pos-checkout-container">
            {/* Header */}
            <div className="pos-checkout-header">
              <button className="pos-checkout-back-btn" onClick={() => setIsCheckoutOpen(false)}>
                <ChevronLeft size={24} color="#555" />
              </button>
              <h2 className="pos-checkout-title">Thanh toán</h2>
              <div style={{ width: '24px' }}></div>
            </div>

            {/* Total Amount Card */}
            <div className="pos-checkout-total-card">
              <span className="pos-checkout-total-label">Tổng tiền:</span>
              <span className="pos-checkout-total-value">{finalTotal.toLocaleString('vi-VN')}đ</span>
            </div>

            {/* Tabs */}
            <div className="pos-checkout-tabs">
              <button 
                className={`pos-checkout-tab ${paymentMethod === 'cash' ? 'active' : ''}`}
                onClick={() => setPaymentMethod('cash')}
              >
                Tiền mặt
              </button>
              <button 
                className={`pos-checkout-tab ${paymentMethod === 'transfer' ? 'active' : ''}`}
                onClick={() => setPaymentMethod('transfer')}
              >
                Chuyển khoản
              </button>
            </div>

            {/* Content Area */}
            <div className="pos-checkout-content">
              {paymentMethod === 'cash' ? (
                <div className="pos-cash-method">
                  {/* Cash input card */}
                  <div className="pos-cash-input-card">
                    <div className="pos-cash-input-top">
                      <span className="pos-cash-input-label">Khách đưa:</span>
                      <span className={`pos-cash-input-value ${cashInput === '0' ? 'placeholder' : ''}`}>
                        {(parseInt(cashInput) || 0).toLocaleString('vi-VN')}đ
                      </span>
                    </div>
                    <div className="pos-cash-input-bottom">
                      <span className="pos-change-label">Tiền thừa:</span>
                      <span className={`pos-change-value ${parseInt(cashInput) >= finalTotal ? 'positive' : ''}`}>
                        {parseInt(cashInput) >= finalTotal 
                          ? (parseInt(cashInput) - finalTotal).toLocaleString('vi-VN') + 'đ' 
                          : '0đ'}
                      </span>
                    </div>
                  </div>

                  {/* Keypad */}
                  <div className="pos-keypad">
                    <button className="pos-keypad-btn" onClick={() => handleKeypadPress('1')}>1</button>
                    <button className="pos-keypad-btn" onClick={() => handleKeypadPress('2')}>2</button>
                    <button className="pos-keypad-btn" onClick={() => handleKeypadPress('3')}>3</button>
                    
                    {/* Backspace spans 2 rows in column 4 */}
                    <button className="pos-keypad-btn pos-keypad-backspace" onClick={() => handleKeypadPress('backspace')}>
                      <svg width="24" height="18" viewBox="0 0 24 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M9 3L2 9L9 15H21V3H9Z" stroke="#349409" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M12 7L16 11" stroke="#349409" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M16 7L12 11" stroke="#349409" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </button>
                    
                    <button className="pos-keypad-btn" onClick={() => handleKeypadPress('4')}>4</button>
                    <button className="pos-keypad-btn" onClick={() => handleKeypadPress('5')}>5</button>
                    <button className="pos-keypad-btn" onClick={() => handleKeypadPress('6')}>6</button>
                    
                    <button className="pos-keypad-btn" onClick={() => handleKeypadPress('7')}>7</button>
                    <button className="pos-keypad-btn" onClick={() => handleKeypadPress('8')}>8</button>
                    <button className="pos-keypad-btn" onClick={() => handleKeypadPress('9')}>9</button>
                    
                    {/* NHẬP spans 2 rows in column 4 */}
                    <button className="pos-keypad-btn pos-keypad-enter" onClick={() => {
                      if (parseInt(cashInput) === 0) {
                        setCashInput(finalTotal.toString());
                      }
                    }}>
                      NHẬP
                    </button>
                    
                    <button className="pos-keypad-btn" onClick={() => handleKeypadPress('C')}>C</button>
                    <button className="pos-keypad-btn" onClick={() => handleKeypadPress('0')}>0</button>
                    <button className="pos-keypad-btn" onClick={() => handleKeypadPress('000')}>000</button>
                  </div>
                </div>
              ) : (
                <div className="pos-transfer-method">
                  <input 
                    type="file" 
                    accept="image/*" 
                    capture="environment" 
                    id="pos-camera-input" 
                    style={{ display: 'none' }}
                    onChange={handleImageChange}
                  />
                  <label htmlFor="pos-camera-input" className="pos-camera-card">
                    {paymentImage ? (
                      <img src={paymentImage} alt="proof" className="pos-proof-preview" />
                    ) : (
                      <div className="pos-camera-placeholder">
                        <Camera size={64} color="#ccc" />
                      </div>
                    )}
                  </label>
                </div>
              )}
            </div>

            {/* Bottom Checkout Button */}
            <div className="pos-checkout-footer">
              <button 
                className="pos-checkout-submit-btn"
                disabled={
                  paymentMethod === 'cash' 
                    ? (parseInt(cashInput) || 0) < finalTotal 
                    : !paymentImage
                }
                onClick={handleCompletePayment}
              >
                HOÀN TẤT THANH TOÁN
              </button>
          </div>
        </div>
      </div>
      )}
      {/* Card Selection Screen Overlay */}
      {isCardSelectionOpen && (
        <div className="pos-card-selection-overlay">
          <div className="pos-card-selection-container">
            {/* Header Success Section */}
            <div className="pos-card-selection-header">
              <div className="pos-card-success-circle">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M20 6L9 17L4 12" stroke="#349409" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <h2 className="pos-card-success-title">Thanh Toán Hoàn Tất!</h2>
            </div>

            {/* Title Section */}
            <div className="pos-card-selection-subheader">
              <span className="pos-card-selection-title">Thẻ trống</span>
              <span className="pos-card-selection-count">({freeCards.length})</span>
            </div>

            {/* Grid List of Free Cards */}
            <div className="pos-card-selection-grid">
              {freeCards.map((card) => {
                const isSelected = selectedCardNumber === card.cardNumber;
                return (
                  <button
                    key={card.id}
                    className={`pos-card-selection-btn ${isSelected ? 'active' : ''}`}
                    onClick={() => setSelectedCardNumber(card.cardNumber)}
                  >
                    {card.cardNumber}
                  </button>
                );
              })}
            </div>

            {/* Action Buttons */}
            <div className="pos-card-selection-footer">
              {(isTakeawayOnly || (hasAllDay && !has4h)) && (
                <button 
                  className="pos-card-btn-skip"
                  onClick={handleSkipCardSelection}
                >
                  BỎ QUA
                </button>
              )}
              
              {!isTakeawayOnly && (
                <button 
                  className="pos-card-btn-select"
                  disabled={!selectedCardNumber}
                  onClick={handleSelectCardSelection}
                >
                  {has4h ? 'CHỌN' : 'XONG'}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
