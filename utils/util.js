function formatDate(dateStr, fmt = 'YYYY-MM-DD') {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  const o = {
    'YYYY': d.getFullYear(),
    'MM': String(d.getMonth() + 1).padStart(2, '0'),
    'DD': String(d.getDate()).padStart(2, '0'),
    'HH': String(d.getHours()).padStart(2, '0'),
    'mm': String(d.getMinutes()).padStart(2, '0'),
    'ss': String(d.getSeconds()).padStart(2, '0')
  };
  return fmt.replace(/YYYY|MM|DD|HH|mm|ss/g, k => o[k]);
}

function formatTime(dateStr) {
  return formatDate(dateStr, 'HH:mm');
}

function getOrderStatusText(status) {
  const map = {
    pending: '待确认',
    confirmed: '已确认',
    in_progress: '进行中',
    completed: '已完成',
    cancelled: '已取消'
  };
  return map[status] || status;
}

function getOrderStatusColor(status) {
  const map = {
    pending: '#FAAD14',
    confirmed: '#1677FF',
    in_progress: '#52C41A',
    completed: '#999999',
    cancelled: '#FF4D4F'
  };
  return map[status] || '#999';
}

function getDateRange(days) {
  const dates = [];
  const today = new Date();
  for (let i = 0; i < days; i++) {
    const d = new Date(today);
    d.setDate(d.getDate() + i);
    dates.push({
      value: formatDate(d),
      label: i === 0 ? '今天' : i === 1 ? '明天' : i === 2 ? '后天' : formatDate(d, 'MM月DD日'),
      weekday: ['周日', '周一', '周二', '周三', '周四', '周五', '周六'][d.getDay()]
    });
  }
  return dates;
}

function getTimeSlots() {
  const slots = [];
  for (let h = 8; h <= 19; h++) {
    for (let m = 0; m < 60; m += 30) {
      const time = String(h).padStart(2, '0') + ':' + String(m).padStart(2, '0');
      slots.push({ value: time, label: time });
    }
  }
  return slots;
}

module.exports = { formatDate, formatTime, getOrderStatusText, getOrderStatusColor, getDateRange, getTimeSlots };
