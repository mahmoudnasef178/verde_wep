'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import styles from './orders.module.css';

interface OrderItem {
  _id?: string;
  name?: string;
  quantity?: number;
  img?: string;
  price?: number;
  size?: string;
}

interface ShippingAddress {
  fullName?: string;
  phone?: string;
  city?: string;
  address?: string;
  email?: string;
  postalCode?: string;
}

export interface AdminOrder {
  _id: string;
  createdAt?: string;
  status?: 'Pending' | 'Processing' | 'Prepared' | 'Shipped' | 'Delivered' | 'Cancelled' | string;
  shippingAddress?: ShippingAddress;
  orderItems?: OrderItem[];
  paymentMethod?: string;
  itemsPrice?: number;
  shippingPrice?: number;
  discount?: number;
  couponCode?: string;
  totalPrice?: number;
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
        throw new Error(`Failed to load orders (HTTP ${res.status})`);
      }
      const data = await res.json();
      if (Array.isArray(data.orders)) {
        setOrders(data.orders);
      } else if (Array.isArray(data)) {
        setOrders(data);
      } else {
        setOrders([]);
      }
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
        throw new Error('فشل تحديث حالة الطلب');
      }

      setOrders((prev) =>
        prev.map((ord) =>
          ord._id === orderId ? { ...ord, status: newStatus } : ord
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
    const list = Array.isArray(orders) ? orders : [];
    const total = list.length;
    const pending = list.filter((o) => o?.status === 'Pending').length;
    const shipped = list.filter((o) => o?.status === 'Shipped' || o?.status === 'Prepared' || o?.status === 'Processing').length;
    const delivered = list.filter((o) => o?.status === 'Delivered').length;
    const revenue = list
      .filter((o) => o?.status !== 'Cancelled')
      .reduce((sum, o) => sum + (Number(o?.totalPrice) || 0), 0);

    return { total, pending, shipped, delivered, revenue };
  }, [orders]);

  // Counts for tabs
  const statusCounts = useMemo(() => {
    const counts: Record<string, number> = { all: (orders || []).length };
    (orders || []).forEach((o) => {
      if (o?.status) {
        counts[o.status] = (counts[o.status] || 0) + 1;
      }
    });
    return counts;
  }, [orders]);

  // Filtered orders
  const filteredOrders = useMemo(() => {
    const list = Array.isArray(orders) ? orders : [];
    return list.filter((order) => {
      if (!order) return false;
      // Status filter
      if (selectedStatus !== 'all' && order.status !== selectedStatus) {
        return false;
      }
      // Search filter
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase().trim();
      const name = (order.shippingAddress?.fullName || '').toLowerCase();
      const phone = order.shippingAddress?.phone || '';
      const city = (order.shippingAddress?.city || '').toLowerCase();
      const address = (order.shippingAddress?.address || '').toLowerCase();
      const id = (order._id || '').toLowerCase();
      const items = (order.orderItems || []).map((i) => (i?.name || '').toLowerCase()).join(' ');

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
  const getWhatsAppLink = (phone?: string, customerName?: string, orderId?: string) => {
    let clean = (phone || '').replace(/[^\d+]/g, '');
    if (clean.startsWith('01')) {
      clean = '2' + clean;
    } else if (clean.startsWith('+201')) {
      clean = clean.replace('+', '');
    }
    const safeName = customerName || 'العميل العزيز';
    const safeId = orderId ? orderId.slice(-6).toUpperCase() : '';
    const text = encodeURIComponent(
      `مرحباً ${safeName}،\nتواصل معك بخصوص طلبك من Verde Parfums برقم (#${safeId}).\nهل يمكننا مساعدتك؟`
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
            let dateStr = '—';
            try {
              if (order.createdAt) {
                const d = new Date(order.createdAt);
                if (!isNaN(d.getTime())) {
                  dateStr = d.toLocaleDateString('ar-EG', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                  }) + ' ' + d.toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' });
                }
              }
            } catch {
              dateStr = order.createdAt ? String(order.createdAt).slice(0, 10) : '—';
            }

            const shortId = order._id ? order._id.slice(-6).toUpperCase() : 'UNKNOWN';
            const orderStatus = order.status || 'Pending';

            return (
              <div key={order._id || Math.random()} className={styles.orderCard}>
                {/* Header inside card */}
                <div className={styles.cardHeader}>
                  <div className={styles.orderMeta}>
                    <span className={styles.orderId} title={`ID: ${order._id}`}>
                      #{shortId}
                    </span>
                    <span className={styles.orderDate}>{dateStr}</span>
                  </div>

                  <div className={`${styles.statusBadge} ${styles[`status_${orderStatus}`] || ''}`}>
                    {orderStatus === 'Pending' && '🟡 قيد الانتظار'}
                    {orderStatus === 'Processing' && '🔵 قيد المراجعة'}
                    {orderStatus === 'Prepared' && '📦 تم التجهيز'}
                    {orderStatus === 'Shipped' && '🚚 تم الشحن'}
                    {orderStatus === 'Delivered' && '🟢 تم التوصيل'}
                    {orderStatus === 'Cancelled' && '🔴 ملغي'}
                    {!['Pending', 'Processing', 'Prepared', 'Shipped', 'Delivered', 'Cancelled'].includes(orderStatus) && orderStatus}
                  </div>
                </div>

                {/* Customer Information */}
                <div className={styles.customerSection}>
                  <div className={styles.customerBox}>
                    <span className={styles.boxTitle}>بيانات العميل (Customer)</span>
                    <span className={styles.customerName}>{order.shippingAddress?.fullName || 'بدون اسم'}</span>
                    <div className={styles.contactRow}>
                      <span className={styles.phoneLink}>📞 {order.shippingAddress?.phone || '—'}</span>
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
                      <strong>{order.shippingAddress?.city || 'المحافظة غير محددة'}</strong>
                      <br />
                      {order.shippingAddress?.address || 'العنوان غير مدخل'}
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
                  {(order.orderItems || []).map((item, idx) => {
                    const itemQty = Number(item.quantity) || 1;
                    const itemPrice = Number(item.price) || 0;
                    return (
                      <div key={item._id || idx} className={styles.itemRow}>
                        <div className={styles.itemLeft}>
                          {item.img ? (
                            /* Using regular img tag for bulletproof image loading without next/image remotePattern crashes */
                            <img
                              src={item.img}
                              alt={item.name || 'عطر'}
                              width={48}
                              height={48}
                              className={styles.itemThumb}
                              onError={(e) => {
                                const el = e.currentTarget as HTMLElement;
                                el.style.display = 'none';
                                const fallback = el.parentElement?.querySelector('.img-fallback') as HTMLElement;
                                if (fallback) fallback.style.display = 'flex';
                              }}
                            />
                          ) : null}
                          <div
                            className={`${styles.itemThumb} img-fallback`}
                            style={{
                              display: item.img ? 'none' : 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                            }}
                          >
                            🌿
                          </div>
                          <div className={styles.itemInfo}>
                            <span className={styles.itemName}>{item.name || 'منتج'}</span>
                            <span className={styles.itemSize}>{item.size || '50ml'}</span>
                          </div>
                        </div>

                        <div className={styles.itemRight}>
                          <span className={styles.itemPrice}>
                            {(itemPrice * itemQty).toLocaleString()} ج.م
                          </span>
                          <span className={styles.itemQty}>
                            {itemQty} × {itemPrice.toLocaleString()} ج.م
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Card Footer: Totals and Status Changer */}
                <div className={styles.cardFooter}>
                  <div className={styles.totalsBox}>
                    <div>
                      <span className={styles.totalLabel}>الإجمالي الكلي: </span>
                      <span className={styles.totalAmount}>
                        {(Number(order.totalPrice) || 0).toLocaleString()} ج.م
                      </span>
                    </div>

                    <span className={styles.paymentTag}>
                      {order.paymentMethod === 'COD'
                        ? 'الدفع عند الاستلام (COD)'
                        : order.paymentMethod || 'COD'}
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
                      value={orderStatus}
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
