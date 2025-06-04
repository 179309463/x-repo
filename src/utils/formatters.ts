/**
 * 格式化金额，根据数值大小自动选择单位（万/亿）
 * @param value 数值或字符串，单位为元
 * @param digits 小数位数，默认为2
 * @returns 格式化后的字符串
 */
export function formatAmount(value: number | string | null | undefined, digits: number = 2): string {
  if (value === null || value === undefined) {
    return '-';
  }
  
  // 将输入值转换为数字
  const numValue = typeof value === 'string' ? Number(value) : value;
  
  // 检查是否为有效的有限数字
  if (!Number.isFinite(numValue)) {
    return '-';
  }
  
  if (numValue >= 100000000) { // 亿
    return (numValue / 100000000).toFixed(digits) + '亿';
  } else if (numValue >= 10000) { // 万
    return (numValue / 10000).toFixed(digits) + '万';
  } else {
    return numValue.toFixed(digits);
  }
}

/**
 * 格式化利率百分比
 * @param value 小数形式的利率
 * @param digits 小数位数，默认为4
 * @returns 格式化后的百分比字符串
 */
export function formatRate(value: number, digits: number = 4): string {
  if (value === null || value === undefined) {
    return '-';
  }
  return (value * 100).toFixed(digits);
}

/**
 * 格式化日期
 * @param date 日期字符串或Date对象
 * @param format 日期格式，默认为YYYY-MM-DD
 * @returns 格式化后的日期字符串
 */
export function formatDate(date: string | Date, format: string = 'YYYY-MM-DD'): string {
  if (!date) return '-';
  
  const d = typeof date === 'string' ? new Date(date) : date;
  
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  
  return format
    .replace('YYYY', String(year))
    .replace('MM', month)
    .replace('DD', day);
}

/**
 * 获取状态对应的类名
 * @param status 状态值
 * @param type 状态类型
 * @returns 对应的CSS类名
 */
export function getStatusClass(status: string, type: 'order' | 'inquiry' | 'trade'): string {
  if (type === 'order') {
    return status === 'confirmed' ? 'default' : 'secondary';
  } else if (type === 'inquiry') {
    return status === 'inquiring' ? 'danger' : 'default';
  } else if (type === 'trade') {
    if (status === 'completed') return 'success';
    if (status === 'partial') return 'warning';
    return 'danger';
  }
  
  return 'default';
}

/**
 * 获取订单类型对应的类名
 * @param type 订单类型
 * @returns 对应的CSS类名
 */
export function getOrderTypeClass(type: string): string {
  return type === 'buy' ? 'default' : 'secondary';
}

/**
 * 获取金额类型对应的类名
 * @param type 金额类型
 * @returns 对应的CSS类名
 */
export function getAmountClass(type: string): string {
  switch (type) {
    case 'completed':
      return 'amount-completed';
    case 'anonymous':
      return 'amount-anonymous';
    case 'warning':
      return 'amount-warning';
    case 'normal':
    default:
      return 'amount-normal';
  }
}