import React, { useState } from 'react';
import { Search, Eye, Edit2, Trash2, ChevronDown, ChevronUp, X } from 'lucide-react';
import './CategoryListPage.css';

const mockCategories = [
  {
    id: 1, 
    name: 'CÀ PHÊ', 
    count: 5,
    priceTakeaway: '25.000', price4H: '35.000', priceAllDay: '45.000',
    lastUpdated: '14:45 19/05/2026', updatedBy: 'Nguyễn Văn A',
    products: ['Cà Phê Đen Đá', 'Cà Phê Sữa', 'Cà Phê Muối', 'Cà Phê Bạc Xỉu', 'Cold Brew']
  },
  {
    id: 2, 
    name: 'TRÀ', 
    count: 7,
    priceTakeaway: '30.000', price4H: '40.000', priceAllDay: '50.000',
    lastUpdated: '09:20 18/05/2026', updatedBy: 'Trần Thị B',
    products: ['Trà Đào', 'Trà Vải', 'Trà Lài', 'Trà Bí Đao', 'Trà Đen', 'Trà Xanh', 'Trà Gừng']
  },
  { 
    id: 3, 
    name: 'NƯỚC ÉP', 
    count: 2, 
    priceTakeaway: '35.000', price4H: '45.000', priceAllDay: '55.000',
    lastUpdated: '16:10 17/05/2026', updatedBy: 'Lê Văn C',
    products: ['Nước Ép Cam', 'Nước Ép Táo'] 
  },
  { 
    id: 4, 
    name: 'TRÀ SỮA', 
    count: 3, 
    priceTakeaway: '25.000', price4H: '35.000', priceAllDay: '45.000',
    lastUpdated: '11:05 16/05/2026', updatedBy: 'Nguyễn Văn A',
    products: ['Trà Sữa Trân Châu', 'Trà Sữa Thái Xanh', 'Trà Sữa Thái Đỏ'] 
  },
  { 
    id: 5, name: 'BÁNH NGỌT', count: 4, 
    priceTakeaway: '30.000', price4H: '30.000', priceAllDay: '30.000',
    lastUpdated: '10:00 21/05/2026', updatedBy: 'Trần Thị B',
    products: ['Tiramisu', 'Mousse', 'Cheesecake'] 
  },
  { 
    id: 6, name: 'SNACK', count: 5, 
    priceTakeaway: '15.000', price4H: '15.000', priceAllDay: '15.000',
    lastUpdated: '08:30 22/05/2026', updatedBy: 'Lê Văn C',
    products: ['Hạt Hướng Dương', 'Khô Gà', 'Đậu Phộng'] 
  },
  { 
    id: 7, name: 'NƯỚC NGỌT', count: 6, 
    priceTakeaway: '20.000', price4H: '25.000', priceAllDay: '30.000',
    lastUpdated: '07:15 23/05/2026', updatedBy: 'Hệ Thống',
    products: ['Coca Cola', 'Pepsi', 'Sprite', '7Up'] 
  }
];

export default function CategoryListPage() {
  const [categories, setCategories] = useState(mockCategories);
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedCats, setExpandedCats] = useState<number[]>([]);

  // Add Category Modal states
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [priceTakeaway, setPriceTakeaway] = useState('');
  const [price4H, setPrice4H] = useState('');
  const [priceAllDay, setPriceAllDay] = useState('');

  // View Category state
  const [viewingCategory, setViewingCategory] = useState<any>(null);

  // Edit Category states
  const [editingCategory, setEditingCategory] = useState<any>(null);
  const [editCategoryName, setEditCategoryName] = useState('');
  const [editPriceTakeaway, setEditPriceTakeaway] = useState('');
  const [editPrice4H, setEditPrice4H] = useState('');
  const [editPriceAllDay, setEditPriceAllDay] = useState('');

  // Delete Category states
  const [deletingCategory, setDeletingCategory] = useState<any>(null);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');

  // Bulk Price Modal states
  const [isBulkPriceModalOpen, setIsBulkPriceModalOpen] = useState(false);
  const [bulkPriceTakeaway, setBulkPriceTakeaway] = useState('');
  const [bulkPrice4H, setBulkPrice4H] = useState('');
  const [bulkPriceAllDay, setBulkPriceAllDay] = useState('');
  const [selectedBulkCategories, setSelectedBulkCategories] = useState<number[]>([]);

  const handleDeleteCategory = () => {
    if (!deletingCategory) return;
    
    setCategories(prev => {
      // Create a copy of categories without the deleted one
      let newCategories = prev.filter(c => c.id !== deletingCategory.id);
      
      // Move products
      if (deletingCategory.products && deletingCategory.products.length > 0) {
        let khacCategory = newCategories.find(c => c.name.toUpperCase() === 'KHÁC');
        
        if (!khacCategory) {
          khacCategory = {
            id: 999,
            name: 'KHÁC',
            count: 0,
            priceTakeaway: '0', price4H: '0', priceAllDay: '0',
            lastUpdated: 'Vừa xong',
            updatedBy: 'Hệ Thống',
            products: []
          };
          newCategories.push(khacCategory);
        } else {
          khacCategory = { ...khacCategory };
          newCategories = newCategories.map(c => c.id === khacCategory!.id ? khacCategory! : c);
        }
        
        khacCategory.products = [...khacCategory.products, ...deletingCategory.products];
        khacCategory.count = khacCategory.products.length;
      }
      
      return newCategories;
    });
    
    setDeletingCategory(null);
  };

  const openEditModal = (category: any) => {
    setEditingCategory(category);
    setEditCategoryName(category.name);
    setEditPriceTakeaway(category.priceTakeaway || '');
    setEditPrice4H(category.price4H || '');
    setEditPriceAllDay(category.priceAllDay || '');
  };

  const handleBulkPriceUpdate = () => {
    setCategories(prev => prev.map(c => {
      if (selectedBulkCategories.includes(c.id)) {
        return {
          ...c,
          priceTakeaway: bulkPriceTakeaway,
          price4H: bulkPrice4H,
          priceAllDay: bulkPriceAllDay,
          lastUpdated: 'Vừa xong',
          updatedBy: 'Hệ Thống'
        };
      }
      return c;
    }));
    setIsBulkPriceModalOpen(false);
    setBulkPriceTakeaway('');
    setBulkPrice4H('');
    setBulkPriceAllDay('');
  };

  const handleSelectAllBulk = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedBulkCategories(categories.map(c => c.id));
    } else {
      setSelectedBulkCategories([]);
    }
  };

  const handleSelectBulkRow = (id: number) => {
    setSelectedBulkCategories(prev => 
      prev.includes(id) ? prev.filter(cId => cId !== id) : [...prev, id]
    );
  };

  const formatCurrency = (value: string) => {
    const numericValue = value.replace(/\D/g, '');
    if (!numericValue) return '';
    return Number(numericValue).toLocaleString('vi-VN').replace(/,/g, '.');
  };

  const handlePriceChange = (setter: React.Dispatch<React.SetStateAction<string>>) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setter(formatCurrency(e.target.value));
  };

  const filteredCategories = categories.filter(cat => 
    cat.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const toggleExpand = (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    if (expandedCats.includes(id)) {
      setExpandedCats(expandedCats.filter(catId => catId !== id));
    } else {
      setExpandedCats([...expandedCats, id]);
    }
  };

  return (
    <div className="category-list-container">
      <div className="category-list-header">
        <h1 className="category-list-title">Danh Mục Sản Phẩm</h1>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button className="btn-add-category outline" onClick={() => {
            setIsBulkPriceModalOpen(true);
            setSelectedBulkCategories(categories.map(c => c.id));
          }}>
            Cấu hình giá hàng loạt
          </button>
          <button className="btn-add-category" onClick={() => setIsAddModalOpen(true)}>
            + Thêm danh mục
          </button>
        </div>
      </div>

      <div className="category-filter-bar">
        <div className="category-search-wrapper">
          <Search size={18} className="category-search-icon" />
          <input 
            type="text" 
            className="category-search-input" 
            placeholder="Tìm kiếm danh mục sản phẩm ..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="category-table-header">
        <div className="category-col-actions"></div>
        <div className="category-col-name">
          <span>Danh Mục</span>
        </div>
        <div className="category-col-count">
          <span>Số Lượng Sản Phẩm</span>
        </div>
        <div className="category-col-chevron"></div>
      </div>

      <div className="category-list-body">
        {filteredCategories.map(category => {
          const isExpanded = expandedCats.includes(category.id);
          
          return (
            <div key={category.id} className={`category-accordion ${isExpanded ? 'expanded' : ''}`}>
              <div className="category-item-header" onClick={(e) => toggleExpand(category.id, e)}>
                <div className="category-col-actions" onClick={(e) => e.stopPropagation()}>
                  <div className="category-item-actions">
                    <button className="btn-icon-action" title="Xem chi tiết" onClick={() => setViewingCategory(category)}>
                      <Eye size={16} />
                    </button>
                    <button className="btn-icon-action" title="Chỉnh sửa" onClick={() => openEditModal(category)}>
                      <Edit2 size={16} />
                    </button>
                    <button className="btn-icon-action delete" title="Xóa" onClick={() => {
                      setDeletingCategory(category);
                      setDeleteConfirmText('');
                    }}>
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
                <div className="category-col-name">
                  <span className="category-item-name">{category.name}</span>
                </div>
                <div className="category-col-count">
                  <span className="category-item-count">{category.count}</span>
                </div>
                <div className="category-col-chevron">
                  <button className="btn-expand" onClick={(e) => toggleExpand(category.id, e)}>
                    {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                  </button>
                </div>
              </div>
              
              {isExpanded && (
                <ul className="category-product-list">
                  {category.products.map((product, index) => (
                    <li key={index} className="category-product-item">
                      {product}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          );
        })}
      </div>

      {/* Add Category Modal */}
      {isAddModalOpen && (
        <div className="category-modal-overlay">
          <div className="category-modal-content" onClick={e => e.stopPropagation()}>
            <div className="category-modal-header">
              <h2 className="category-modal-title">Thêm Danh Mục Mới</h2>
              {/* <button className="btn-close-modal" onClick={() => setIsAddModalOpen(false)}>
                <X size={24} />
              </button> */}
            </div>

            <div className="category-modal-body">
              <div className="form-group">
                <label>Tên Danh Mục <span style={{ color: 'red' }}>*</span></label>
                <input 
                  type="text" 
                  className={`modal-input ${newCategoryName.trim().toUpperCase() === 'KHÁC' ? 'error' : ''}`} 
                  placeholder="Nhập tên danh mục..."
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                />
                {newCategoryName.trim().toUpperCase() === 'KHÁC' && (
                  <span style={{ color: '#dc3545', fontSize: '13px', marginTop: '4px' }}>
                    Tên "KHÁC" là danh mục hệ thống, vui lòng chọn tên khác.
                  </span>
                )}
              </div>

              <div className="form-group">
                <label>Cấu hình giá bán <span style={{ color: 'red' }}>*</span></label>
                <div className="modal-subtitle">Giá sản phẩm trong danh mục áp dụng dự theo cơ cấu đồng giá</div>
                <div className="price-config-box">
                  <div className="price-col">
                    <label>Mang Đi</label>
                    <input 
                      type="text" 
                      className="modal-input" 
                      placeholder="0"
                      value={priceTakeaway}
                      onChange={handlePriceChange(setPriceTakeaway)}
                    />
                  </div>
                  <div className="price-col">
                    <label>Tại chỗ 4H</label>
                    <input 
                      type="text" 
                      className="modal-input" 
                      placeholder="0"
                      value={price4H}
                      onChange={handlePriceChange(setPrice4H)}
                    />
                  </div>
                  <div className="price-col">
                    <label>Tại chỗ Cả ngày</label>
                    <input 
                      type="text" 
                      className="modal-input" 
                      placeholder="0"
                      value={priceAllDay}
                      onChange={handlePriceChange(setPriceAllDay)}
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="category-modal-footer">
              <button className="btn-modal-cancel outline" onClick={() => setIsAddModalOpen(false)}>HỦY</button>
              <button 
                className="btn-modal-submit" 
                onClick={() => setIsAddModalOpen(false)}
                disabled={!newCategoryName.trim() || newCategoryName.trim().toUpperCase() === 'KHÁC' || !priceTakeaway || !price4H || !priceAllDay}
              >
                THÊM
              </button>
            </div>
          </div>
        </div>
      )}

      {/* View Category Modal */}
      {viewingCategory && (
        <div className="category-modal-overlay">
          <div className="category-modal-content" onClick={e => e.stopPropagation()}>
            <div className="category-modal-header">
              <h2 className="category-modal-title">Xem Danh Mục</h2>
              <button className="btn-close-modal" onClick={() => setViewingCategory(null)}>
                <X size={24} />
              </button>
            </div>

            <div className="category-modal-body">
              <div className="form-group">
                <label>Tên Danh Mục</label>
                <input 
                  type="text" 
                  className="modal-input" 
                  value={viewingCategory.name}
                  disabled
                />
              </div>

              <div className="form-group">
                <label>Cấu hình giá bán</label>
                <div className="modal-subtitle">Giá sản phẩm trong danh mục áp dụng dự theo cơ cấu đồng giá</div>
                <div className="price-config-box">
                  <div className="price-col">
                    <label>Mang Đi</label>
                    <input 
                      type="text" 
                      className="modal-input" 
                      value={viewingCategory.priceTakeaway || '0'}
                      disabled
                    />
                  </div>
                  <div className="price-col">
                    <label>Tại chỗ 4H</label>
                    <input 
                      type="text" 
                      className="modal-input" 
                      value={viewingCategory.price4H || '0'}
                      disabled
                    />
                  </div>
                  <div className="price-col">
                    <label>Tại chỗ Cả ngày</label>
                    <input 
                      type="text" 
                      className="modal-input" 
                      value={viewingCategory.priceAllDay || '0'}
                      disabled
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="category-modal-footer" style={{ gridTemplateColumns: '1fr', paddingBottom: '24px' }}>
              <button 
                className="btn-modal-submit" 
                onClick={() => {
                  const cat = viewingCategory;
                  setViewingCategory(null);
                  openEditModal(cat);
                }}
              >
                CHỈNH SỬA DANH MỤC
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Category Modal */}
      {editingCategory && (
        <div className="category-modal-overlay">
          <div className="category-modal-content" onClick={e => e.stopPropagation()}>
            <div className="category-modal-header">
              <h2 className="category-modal-title">Chỉnh Sửa Danh Mục</h2>
              {/* <button className="btn-close-modal" onClick={() => setEditingCategory(null)}>
                <X size={24} />
              </button> */}
            </div>

            <div className="category-modal-body">
              <div className="form-group">
                <label>Tên Danh Mục <span style={{ color: 'red' }}>*</span></label>
                <input 
                  type="text" 
                  className="modal-input" 
                  value={editCategoryName}
                  onChange={(e) => setEditCategoryName(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label>Cấu hình giá bán <span style={{ color: 'red' }}>*</span></label>
                <div className="modal-subtitle">Giá sản phẩm trong danh mục áp dụng dự theo cơ cấu đồng giá</div>
                <div className="price-config-box">
                  <div className="price-col">
                    <label>Mang Đi</label>
                    <input 
                      type="text" 
                      className="modal-input" 
                      value={editPriceTakeaway}
                      onChange={handlePriceChange(setEditPriceTakeaway)}
                    />
                  </div>
                  <div className="price-col">
                    <label>Tại chỗ 4H</label>
                    <input 
                      type="text" 
                      className="modal-input" 
                      value={editPrice4H}
                      onChange={handlePriceChange(setEditPrice4H)}
                    />
                  </div>
                  <div className="price-col">
                    <label>Tại chỗ Cả ngày</label>
                    <input 
                      type="text" 
                      className="modal-input" 
                      value={editPriceAllDay}
                      onChange={handlePriceChange(setEditPriceAllDay)}
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="category-modal-footer" style={{ paddingBottom: '0' }}>
              <button className="btn-modal-cancel outline" onClick={() => setEditingCategory(null)}>HỦY</button>
              <button 
                className="btn-modal-submit" 
                onClick={() => setEditingCategory(null)}
                disabled={!editCategoryName.trim() || !editPriceTakeaway || !editPrice4H || !editPriceAllDay}
              >
                LƯU
              </button>
            </div>
            
            <div className="category-modal-last-updated">
              Cập nhật lần cuối vào {editingCategory.lastUpdated} - {editingCategory.updatedBy}
            </div>
          </div>
        </div>
      )}

      {/* Delete Category Modal */}
      {deletingCategory && (
        <div className="category-modal-overlay">
          <div className="category-modal-content" style={{ maxWidth: '450px' }} onClick={e => e.stopPropagation()}>
            <div className="category-modal-header">
              <h2 className="category-modal-title" style={{ color: '#dc3545' }}>Xác Nhận Xóa</h2>
              {/* <button className="btn-close-modal" onClick={() => setDeletingCategory(null)}>
                <X size={24} />
              </button> */}
            </div>

            <div className="category-modal-body">
              <p style={{ fontSize: '15px', color: '#444', lineHeight: '1.5', margin: 0 }}>
                Bạn có chắc chắn muốn xóa danh mục <strong>{deletingCategory.name}</strong>?<br/>
                Toàn bộ {deletingCategory.count} sản phẩm bên trong sẽ được <strong>tự động chuyển sang danh mục KHÁC</strong> để không bị mất dữ liệu. Hành động này không thể hoàn tác.
              </p>
              
              <div style={{ marginTop: '16px' }}>
                <label style={{ display: 'block', fontSize: '14px', marginBottom: '8px', color: '#333' }}>
                  Vui lòng nhập <strong style={{color: '#dc3545'}}>XÓA {deletingCategory.name}</strong> để xác nhận:
                </label>
                <input 
                  type="text" 
                  className="modal-input" 
                  placeholder={`XÓA ${deletingCategory.name}`}
                  value={deleteConfirmText}
                  onChange={(e) => setDeleteConfirmText(e.target.value)}
                  style={{ width: '100%', boxSizing: 'border-box' }}
                />
              </div>
            </div>

            <div className="category-modal-footer" style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
              <button 
                className="btn-modal-cancel outline" 
                style={{ padding: '10px 20px', width: 'auto' }}
                onClick={() => setDeletingCategory(null)}
              >
                HỦY
              </button>
              <button 
                className="btn-modal-submit btn-modal-delete" 
                style={{ padding: '10px 20px', width: 'auto' }}
                disabled={deleteConfirmText !== `XÓA ${deletingCategory.name}`}
                onClick={handleDeleteCategory}
              >
                XÓA DANH MỤC
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bulk Price Modal */}
      {isBulkPriceModalOpen && (
        <div className="category-modal-overlay">
          <div className="category-modal-content" style={{ maxWidth: '650px' }} onClick={e => e.stopPropagation()}>
            <div className="category-modal-header">
              <h2 className="category-modal-title">Cấu Hình Giá Hàng Loạt</h2>
              {/* <button className="btn-close-modal" onClick={() => setIsBulkPriceModalOpen(false)}>
                <X size={24} />
              </button> */}
            </div>

            <div className="category-modal-body">
              <div className="form-group">
                <label>Cấu hình giá bán <span style={{ color: 'red' }}>*</span></label>
                <div className="price-config-box">
                  <div className="price-col">
                    <label>Mang Đi</label>
                    <input 
                      type="text" 
                      className="modal-input" 
                      placeholder="0"
                      value={bulkPriceTakeaway}
                      onChange={handlePriceChange(setBulkPriceTakeaway)}
                    />
                  </div>
                  <div className="price-col">
                    <label>Tại chỗ 4H</label>
                    <input 
                      type="text" 
                      className="modal-input" 
                      placeholder="0"
                      value={bulkPrice4H}
                      onChange={handlePriceChange(setBulkPrice4H)}
                    />
                  </div>
                  <div className="price-col">
                    <label>Tại chỗ Cả ngày</label>
                    <input 
                      type="text" 
                      className="modal-input" 
                      placeholder="0"
                      value={bulkPriceAllDay}
                      onChange={handlePriceChange(setBulkPriceAllDay)}
                    />
                  </div>
                </div>
              </div>

              <div className="form-group" style={{ marginTop: '16px' }}>
                <label>Bảng đối chiếu giá hiện tại</label>
                <div className="bulk-price-table-container">
                  <table className="bulk-price-table">
                    <thead>
                      <tr>
                        <th style={{ width: '40px', textAlign: 'center' }}>
                          <input 
                            type="checkbox" 
                            checked={selectedBulkCategories.length === categories.length && categories.length > 0}
                            onChange={handleSelectAllBulk}
                            style={{ cursor: 'pointer', width: '16px', height: '16px', accentColor: '#256e05' }}
                          />
                        </th>
                        <th>Danh Mục</th>
                        <th style={{ textAlign: 'center' }}>Mang Đi</th>
                        <th style={{ textAlign: 'center' }}>Tại chỗ 4H</th>
                        <th style={{ textAlign: 'center' }}>Tại chỗ Cả ngày</th>
                      </tr>
                    </thead>
                    <tbody>
                      {categories.map(cat => (
                        <tr key={cat.id} style={{ backgroundColor: selectedBulkCategories.includes(cat.id) ? '#f2f9f0' : 'transparent' }}>
                          <td style={{ textAlign: 'center' }}>
                            <input 
                              type="checkbox" 
                              checked={selectedBulkCategories.includes(cat.id)}
                              onChange={() => handleSelectBulkRow(cat.id)}
                              style={{ cursor: 'pointer', width: '16px', height: '16px', accentColor: '#256e05' }}
                            />
                          </td>
                          <td><strong>{cat.name}</strong></td>
                          <td style={{ textAlign: 'center' }}>{cat.priceTakeaway || '0'}</td>
                          <td style={{ textAlign: 'center' }}>{cat.price4H || '0'}</td>
                          <td style={{ textAlign: 'center' }}>{cat.priceAllDay || '0'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            <div className="category-modal-footer">
              <button className="btn-modal-cancel outline" onClick={() => setIsBulkPriceModalOpen(false)}>HỦY</button>
              <button 
                className="btn-modal-submit" 
                onClick={handleBulkPriceUpdate}
                disabled={!bulkPriceTakeaway || !bulkPrice4H || !bulkPriceAllDay || selectedBulkCategories.length === 0}
              >
                ÁP DỤNG
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
