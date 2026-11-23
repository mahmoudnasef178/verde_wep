'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import Image from 'next/image';
import styles from './orders.module.css';

interface OrderItem {
  _id?: string;
  name: string;
  quantity: number;
  img?: string;
  price: number;
  size?: string;
}

interface ShippingAddress {
  fullName: string;
  phone: string;
  city: string;
  address: string;
  email?: string;
  postalCode?: string;
}

export interface AdminOrder {
  _id: string;
  createdAt: string;
  status: 'Pending' | 'Processing' | 'Prepared' | 'Shipped' | 'Delivered' | 'Cancelled';
  shippingAddress: ShippingAddress;
  orderItems: OrderItem[];
  paymentMethod: string;
  itemsPrice: number;
  shippingPrice: number;
  discount?: number;
  couponCode?: string;
  totalPrice: number;
  isPaid?: boolean;
  notes?: string;
}

const STATUS_OPTIONS = [
  { value: 'all', label: 'الكل (All)', icon: '📋' },
  { value: 'Pending', label: 'قيد الانتظار (Pending)', icon: '🟡' },
  { value: 'Processing', label: 'قيد المراجعة (Processing)', icon: '🔵' },
  { value: 'Prepared', label: 'تم التجهيز (Prepared)', icon: '📦' },
  { value: 'Shipped', label: 'تم الشحن (Shipped)', icon: '🚚' },
  { value: 'Delivered', label: 'تم التوصيل (Delivered)', icon: '🟢' },
  { value: 'Cancelled', label: 'ملغي (Cancelled)', icon: '🔴' },
] as const;

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const fetchOrders = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch('/api/admin/orders', { cache: 'no-store' });
      if (!res.ok) {
        throw new Error(`Failed to load orders (${res.status})`);
      }
      const data = await res.json();
      setOrders(data.orders || []);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error loading orders');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const handleStatusChange = async (orderId: string, newStatus: string) => {
    try {
      setUpdatingId(orderId);
      const res = await fetch(`/api/admin/orders/${orderId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!res.ok) {
        throw new Error('Failed to update status');
      }

      setOrders((prev) =>
        prev.map((ord) =>
          ord._id === orderId ? { ...ord, status: newStatus as AdminOrder['status'] } : ord
        )
      );
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Error updating order status');
    } finally {
      setUpdatingId(null);
    }
  };

  // Calculations for stats
  const stats = useMemo(() => {
    const total = orders.length;
    const pending = orders.filter((o) => o.status === 'Pending').length;
    const shipped = orders.filter((o) => o.status === 'Shipped' || o.status === 'Prepared' || o.status === 'Processing').length;
    const delivered = orders.filter((o) => o.status === 'Delivered').length;
    const revenue = orders
      .filter((o) => o.status !== 'Cancelled')
      .reduce((sum, o) => sum + (o.totalPrice || 0), 0);

    return { total, pending, shipped, delivered, revenue };
  }, [orders]);

  // Counts for tabs
  const statusCounts = useMemo(() => {
    const counts: Record<string, number> = { all: orders.length };
    orders.forEach((o) => {
      counts[o.status] = (counts[o.status] || 0) + 1;
    });
    return counts;
  }, [orders]);

  // Filtered orders
  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      // Status filter
      if (selectedStatus !== 'all' && order.status !== selectedStatus) {
        return false;
      }
      // Search filter
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase().trim();
      const name = order.shippingAddress?.fullName?.toLowerCase() || '';
      const phone = order.shippingAddress?.phone || '';
      const city = order.shippingAddress?.city?.toLowerCase() || '';
      const address = order.shippingAddress?.address?.toLowerCase() || '';
      const id = order._id.toLowerCase();
      const items = order.orderItems?.map((i) => i.name.toLowerCase()).join(' ') || '';

      return (
        name.includes(q) ||
        phone.includes(q) ||
        city.includes(q) ||
        address.includes(q) ||
        id.includes(q) ||
        items.includes(q)
      );
    });
  }, [orders, selectedStatus, searchQuery]);

  // Format WhatsApp Link
  const getWhatsAppLink = (phone: string, customerName: string, orderId: string) => {
    let clean = phone.replace(/[^\d+]/g, '');
    if (clean.startsWith('01')) {
      clean = '2' + clean;
    } else if (clean.startsWith('+201')) {
      clean = clean.replace('+', '');
    }
    const text = encodeURIComponent(
      `مرحباً ${customerName}،\nتواصل معك بخصوص طلبك من Verde Parfums برقم (#${orderId.slice(-6)}).\nهل يمكننا مساعدتك؟`
    );
    return `https://wa.me/${clean}?text=${text}`;
  };

  return (
    <div className={styles.page}>
      {/* Header */}
      <div className={styles.header}>
        <h2 className={styles.heading}>
          <span>📦</span>
          <span>إدارة الطلبات (Orders Management)</span>
        </h2>
        <div className={styles.headerActions}>
          <button
            onClick={fetchOrders}
            className={styles.refreshBtn}
            disabled={loading}
            title="تحديث البيانات"
          >
            <span>🔄</span>
            <span>{loading ? 'جاري التحميل...' : 'تحديث'}</span>
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className={styles.statsGrid}>
        <div className={`${styles.statCard} ${styles.statCard_all}`}>
          <div className={styles.statIcon}>📋</div>
          <div className={styles.statValue}>{stats.total}</div>
          <div className={styles.statLabel}>إجمالي الطلبات</div>
        </div>

        <div className={`${styles.statCard} ${styles.statCard_pending}`}>
          <div className={styles.statIcon}>🟡</div>
          <div className={styles.statValue}>{stats.pending}</div>
          <div className={styles.statLabel}>طلبات جديدة / قيد الانتظار</div>
        </div>

        <div className={`${styles.statCard} ${styles.statCard_shipped}`}>
          <div className={styles.statIcon}>🚚</div>
          <div className={styles.statValue}>{stats.shipped}</div>
          <div className={styles.statLabel}>قيد التجهيز والشحن</div>
        </div>

        <div className={`${styles.statCard} ${styles.statCard_done}`}>
          <div className={styles.statIcon}>🟢</div>
          <div className={styles.statValue}>{stats.delivered}</div>
          <div className={styles.statLabel}>تم التوصيل بنجاح</div>
        </div>

        <div className={`${styles.statCard} ${styles.statCard_revenue}`}>
          <div className={styles.statIcon}>💰</div>
          <div className={styles.statValue}>{stats.revenue.toLocaleString()} ج.م</div>
          <div className={styles.statLabel}>إجمالي الإيرادات الفعالة</div>
        </div>
      </div>

      {/* Toolbar & Filters */}
      <div className={styles.toolbar}>
        <div className={styles.searchWrap}>
          <span className={styles.searchIcon}>🔍</span>
          <input
            type="text"
            className={styles.searchInput}
            placeholder="بحث بالاسم، رقم الهاتف، المدينة، رقم الطلب..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className={styles.filterTabs}>
          {STATUS_OPTIONS.map((opt) => {
            const count = statusCounts[opt.value] || 0;
            const isActive = selectedStatus === opt.value;
            return (
              <button
                key={opt.value}
                onClick={() => setSelectedStatus(opt.value)}
                className={`${styles.filterTab} ${isActive ? styles.filterTabActive : ''}`}
              >
                <span>{opt.icon}</span>
                <span>{opt.label}</span>
                <span className={styles.filterBadge}>{count}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Orders List or States */}
      {loading ? (
        <div className={styles.loadingBox}>
          <div className={styles.spinner} />
          <span>جاري تحميل الطلبات...</span>
        </div>
      ) : error ? (
        <div className={styles.emptyState}>
          <div className={styles.emptyIcon}>⚠️</div>
          <div className={styles.emptyTitle}>حدث خطأ أثناء تحميل الطلبات</div>
          <p>{error}</p>
          <button onClick={fetchOrders} className={styles.refreshBtn} style={{ marginTop: '1rem' }}>
            إعادة المحاولة
          </button>
        </div>
      ) : filteredOrders.length === 0 ? (
        <div className={styles.emptyState}>
          <div className={styles.emptyIcon}>📦</div>
          <div className={styles.emptyTitle}>لا توجد طلبات مطابقة</div>
          <p>لم يتم العثور على أي طلبات في هذا القسم أو بعملية البحث الحالية.</p>
        </div>
      ) : (
        <div className={styles.ordersList}>
          {filteredOrders.map((order) => {
            const dateStr = new Date(order.createdAt).toLocaleString('ar-EG', {
              dateStyle: 'medium',
              timeStyle: 'short',
            });

            return (
              <div key={order._id} className={styles.orderCard}>
                {/* Header inside card */}
                <div className={styles.cardHeader}>
                  <div className={styles.orderMeta}>
                    <span className={styles.orderId} title={`ID: ${order._id}`}>
                      #{order._id.slice(-6).toUpperCase()}
                    </span>
                    <span className={styles.orderDate}>{dateStr}</span>
                  </div>

                  <div className={`${styles.statusBadge} ${styles[`status_${order.status}`]}`}>
                    {order.status === 'Pending' && '🟡 قيد الانتظار'}
                    {order.status === 'Processing' && '🔵 قيد المراجعة'}
                    {order.status === 'Prepared' && '📦 تم التجهيز'}
                    {order.status === 'Shipped' && '🚚 تم الشحن'}
                    {order.status === 'Delivered' && '🟢 تم التوصيل'}
                    {order.status === 'Cancelled' && '🔴 ملغي'}
                  </div>
                </div>

                {/* Customer Information */}
                <div className={styles.customerSection}>
                  <div className={styles.customerBox}>
                    <span className={styles.boxTitle}>بيانات العميل (Customer)</span>
                    <span className={styles.customerName}>{order.shippingAddress?.fullName || 'بدون اسم'}</span>
                    <div className={styles.contactRow}>
                      <span className={styles.phoneLink}>📞 {order.shippingAddress?.phone}</span>
                      {order.shippingAddress?.phone && (
                        <>
                          <a
                            href={getWhatsAppLink(
                              order.shippingAddress.phone,
                              order.shippingAddress.fullName,
                              order._id
                            )}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={styles.waBtn}
                          >
                            💬 واتساب
                          </a>
                          <a href={`tel:${order.shippingAddress.phone}`} className={styles.callBtn}>
                            اتصال
                          </a>
                        </>
                      )}
                    </div>
                  </div>

                  <div className={styles.customerBox}>
                    <span className={styles.boxTitle}>عنوان التوصيل (Shipping Address)</span>
                    <div className={styles.addressText}>
                      <strong>{order.shippingAddress?.city}</strong>
                      <br />
                      {order.shippingAddress?.address}
                    </div>
                  </div>

                  {order.notes && (
                    <div className={styles.customerNotes}>
                      <strong>ملاحظات العميل:</strong> {order.notes}
                    </div>
                  )}
                </div>

                {/* Order Items */}
                <div className={styles.itemsSection}>
                  <span className={styles.boxTitle}>المنتجات المطلوبة ({order.orderItems?.length || 0})</span>
                  {order.orderItems?.map((item, idx) => (
                    <div key={item._id || idx} className={styles.itemRow}>
                      <div className={styles.itemLeft}>
                        {item.img ? (
                          <Image
                            src={item.img}
                            alt={item.name}
                            width={48}
                            height={48}
                            className={styles.itemThumb}
                          />
                        ) : (
                          <div className={styles.itemThumb} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            🌿
                          </div>
                        )}
                        <div className={styles.itemInfo}>
                          <span className={styles.itemName}>{item.name}</span>
                          <span className={styles.itemSize}>{item.size || '50ml'}</span>
                        </div>
                      </div>

                      <div className={styles.itemRight}>
                        <span className={styles.itemPrice}>
                          {(item.price * item.quantity).toLocaleString()} ج.م
                        </span>
                        <span className={styles.itemQty}>
                          {item.quantity} × {item.price.toLocaleString()} ج.م
                        </span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Card Footer: Totals and Status Changer */}
                <div className={styles.cardFooter}>
                  <div className={styles.totalsBox}>
                    <div>
                      <span className={styles.totalLabel}>الإجمالي الكلي: </span>
                      <span className={styles.totalAmount}>
                        {order.totalPrice?.toLocaleString()} ج.م
                      </span>
                    </div>

                    <span className={styles.paymentTag}>
                      {order.paymentMethod === 'COD'
                        ? 'الدفع عند الاستلام (COD)'
                        : order.paymentMethod}
                    </span>

                    {order.discount ? (
                      <span className={styles.paymentTag} style={{ color: '#5aad78' }}>
                        خصم: {order.discount} ج.م {order.couponCode ? `(${order.couponCode})` : ''}
                      </span>
                    ) : null}
                  </div>

                  <div className={styles.actionControls}>
                    <label htmlFor={`status-${order._id}`} className={styles.boxTitle} style={{ margin: 0 }}>
                      تغيير الحالة:
                    </label>
                    <select
                      id={`status-${order._id}`}
                      className={styles.statusSelect}
                      value={order.status}
                      disabled={updatingId === order._id}
                      onChange={(e) => handleStatusChange(order._id, e.target.value)}
                    >
                      <option value="Pending">🟡 قيد الانتظار (Pending)</option>
                      <option value="Processing">🔵 قيد المراجعة (Processing)</option>
                      <option value="Prepared">📦 تم التجهيز (Prepared)</option>
                      <option value="Shipped">🚚 تم الشحن (Shipped)</option>
                      <option value="Delivered">🟢 تم التوصيل (Delivered)</option>
                      <option value="Cancelled">🔴 ملغي (Cancelled)</option>
                    </select>
                    {updatingId === order._id && (
                      <span className={styles.updatingSpinner}>جاري الحفظ...</span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
