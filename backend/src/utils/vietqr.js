export function generateVietQrUrl({
  bankId = 'MB',
  accountNo = '0988888888',
  accountName = 'NGUYEN THI HAN',
  amount = 0,
  description = 'UH',
}) {
  const encodedDesc = encodeURIComponent(description || 'Thanh toan Ut Han Cuon');
  const encodedName = encodeURIComponent(accountName || 'UT HAN CUON');
  const cleanBank = (bankId || 'MB').trim();
  const cleanAccount = (accountNo || '0988888888').trim();
  const cleanAmount = Math.round(Number(amount) || 0);

  return `https://img.vietqr.io/image/${cleanBank}-${cleanAccount}-compact2.png?amount=${cleanAmount}&addInfo=${encodedDesc}&accountName=${encodedName}`;
}
