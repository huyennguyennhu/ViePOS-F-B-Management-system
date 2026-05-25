package com.viepos.backend.services;

import com.viepos.backend.models.*;
import com.viepos.backend.models.enums.AuditAction;
import com.viepos.backend.models.enums.ServiceType;
import com.viepos.backend.models.enums.TransactionType;
import com.viepos.backend.repositories.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.*;

@Service
public class OrderCheckoutService {

    public static class ParsedLineItem {
        private UUID productId;
        private int quantity;
        private BigDecimal unitPrice;
        private String note;
        private ServiceType serviceType;

        public UUID getProductId() { return productId; }
        public void setProductId(UUID productId) { this.productId = productId; }
        public int getQuantity() { return quantity; }
        public void setQuantity(int quantity) { this.quantity = quantity; }
        public BigDecimal getUnitPrice() { return unitPrice; }
        public void setUnitPrice(BigDecimal unitPrice) { this.unitPrice = unitPrice; }
        public String getNote() { return note; }
        public void setNote(String note) { this.note = note; }
        public ServiceType getServiceType() { return serviceType; }
        public void setServiceType(ServiceType serviceType) { this.serviceType = serviceType; }
    }

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private OrderItemRepository orderItemRepository;

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private InventoryTransactionRepository transactionRepository;

    @Autowired
    private InventoryItemRepository inventoryItemRepository;

    @Autowired
    private AuditLogService auditLogService;

    public List<ParsedLineItem> parseItems(List<?> itemsObj) {
        List<ParsedLineItem> result = new ArrayList<>();
        if (itemsObj == null) {
            return result;
        }
        for (Object itemObj : itemsObj) {
            if (!(itemObj instanceof Map<?, ?> itemMap)) {
                continue;
            }
            String productIdStr = firstNonBlank(
                    asString(itemMap.get("id")),
                    asString(itemMap.get("productId"))
            );
            if (productIdStr == null || productIdStr.isEmpty()) {
                continue;
            }
            UUID productId;
            try {
                productId = UUID.fromString(productIdStr);
            } catch (IllegalArgumentException e) {
                continue;
            }

            int quantity = itemMap.get("quantity") != null
                    ? Integer.parseInt(itemMap.get("quantity").toString())
                    : 1;
            if (quantity <= 0) {
                continue;
            }

            BigDecimal unitPrice = itemMap.get("price") != null
                    ? new BigDecimal(itemMap.get("price").toString())
                    : BigDecimal.ZERO;

            ParsedLineItem line = new ParsedLineItem();
            line.setProductId(productId);
            line.setQuantity(quantity);
            line.setUnitPrice(unitPrice);
            line.setNote(asString(itemMap.get("note")));
            line.setServiceType(resolveServiceType(
                    asString(itemMap.get("serveType")),
                    asString(itemMap.get("duration"))
            ));
            result.add(line);
        }
        return result;
    }

    public static ServiceType resolveServiceType(String serveType, String duration) {
        if (serveType != null && "takeaway".equalsIgnoreCase(serveType.trim())) {
            return ServiceType.TAKEAWAY;
        }
        if (duration != null) {
            if ("4h".equalsIgnoreCase(duration.trim())) {
                return ServiceType.FOUR_HOURS;
            }
            if ("all_day".equalsIgnoreCase(duration.trim())) {
                return ServiceType.FULL_DAY;
            }
        }
        return ServiceType.TAKEAWAY;
    }

    @Transactional
    public List<OrderItem> saveOrderItems(Order order, List<?> itemsObj, boolean appendTotals) {
        List<ParsedLineItem> parsed = parseItems(itemsObj);
        List<OrderItem> saved = new ArrayList<>();
        BigDecimal linesSubtotal = BigDecimal.ZERO;

        for (ParsedLineItem line : parsed) {
            Product product = productRepository.findById(line.getProductId())
                    .orElseThrow(() -> new IllegalArgumentException(
                            "Không tìm thấy sản phẩm: " + line.getProductId()));

            OrderItem orderItem = new OrderItem();
            orderItem.setOrder(order);
            orderItem.setProduct(product);
            orderItem.setQuantity(line.getQuantity());
            orderItem.setUnitPrice(line.getUnitPrice());
            orderItem.setLineTotal(line.getUnitPrice().multiply(BigDecimal.valueOf(line.getQuantity())));
            orderItem.setServiceType(line.getServiceType());
            orderItem.setNote(line.getNote());

            saved.add(orderItemRepository.save(orderItem));
            linesSubtotal = linesSubtotal.add(orderItem.getLineTotal());
        }

        if (!saved.isEmpty()) {
            if (appendTotals) {
                BigDecimal currentSub = order.getSubtotalAmount() != null ? order.getSubtotalAmount() : BigDecimal.ZERO;
                order.setSubtotalAmount(currentSub.add(linesSubtotal));
                BigDecimal currentTotal = order.getTotalAmount() != null ? order.getTotalAmount() : BigDecimal.ZERO;
                order.setTotalAmount(currentTotal.add(linesSubtotal));
            } else {
                order.setSubtotalAmount(linesSubtotal);
                order.setTotalAmount(linesSubtotal);
            }
            if (order.getCompletedAt() == null) {
                order.setCompletedAt(LocalDateTime.now());
            }
            orderRepository.save(order);
        }

        return saved;
    }

    @Transactional
    public void deductInventoryForSale(Order order, List<OrderItem> items, User actor) {
        if (items == null || items.isEmpty()) {
            return;
        }
        User createdBy = actor != null ? actor : auditLogService.getCurrentUser();
        if (createdBy == null) {
            return;
        }

        InventoryTransaction transaction = new InventoryTransaction();
        transaction.setInvenTransactionId("SALE-" + order.getOrderCode() + "-" + System.currentTimeMillis());
        transaction.setTransactionType(TransactionType.SALE);
        transaction.setReferenceId(order.getId());
        transaction.setCreatedBy(createdBy);
        transaction.setNote("Trừ tồn kho từ đơn " + order.getOrderCode());
        transaction = transactionRepository.save(transaction);

        for (OrderItem item : items) {
            Product product = item.getProduct();
            if (product == null) {
                continue;
            }
            BigDecimal qty = BigDecimal.valueOf(item.getQuantity());
            BigDecimal stockBefore = product.getCurrentStock() != null ? product.getCurrentStock() : BigDecimal.ZERO;
            BigDecimal stockAfter = stockBefore.subtract(qty);

            product.setCurrentStock(stockAfter);
            BigDecimal minimum = product.getMinimumStock() != null ? product.getMinimumStock() : BigDecimal.ZERO;
            product.setIsOutOfStock(stockAfter.compareTo(minimum) <= 0);
            productRepository.save(product);

            InventoryItem invItem = new InventoryItem();
            invItem.setInventoryTransaction(transaction);
            invItem.setProduct(product);
            invItem.setQuantity(qty);
            invItem.setUnitCost(product.getCostPrice() != null ? product.getCostPrice() : BigDecimal.ZERO);
            invItem.setStockBefore(stockBefore);
            invItem.setStockAfter(stockAfter);
            inventoryItemRepository.save(invItem);
        }
    }

    public void auditOrderCreate(User actor, Order order, List<OrderItem> items) {
        Map<String, Object> snapshot = new LinkedHashMap<>();
        snapshot.put("orderCode", order.getOrderCode());
        snapshot.put("status", order.getStatus() != null ? order.getStatus().name() : null);
        snapshot.put("subtotalAmount", order.getSubtotalAmount());
        snapshot.put("totalAmount", order.getTotalAmount());
        snapshot.put("itemCount", items != null ? items.size() : 0);
        auditLogService.log(actor, AuditAction.CREATE, "orders", order.getId(), null, snapshot);
    }

    @Transactional
    public List<OrderItem> completeCheckout(Order order, List<?> itemsObj, User actor, boolean appendTotals) {
        List<OrderItem> saved = saveOrderItems(order, itemsObj, appendTotals);
        if (!saved.isEmpty()) {
            deductInventoryForSale(order, saved, actor);
        }
        auditOrderCreate(actor, order, saved);
        return saved;
    }

    private static String asString(Object value) {
        return value == null ? null : value.toString();
    }

    private static String firstNonBlank(String... values) {
        for (String v : values) {
            if (v != null && !v.isBlank()) {
                return v;
            }
        }
        return null;
    }
}
