export interface TradePanelProps {
  symbol?: string
  currentPrice?: number
  positionQty?: number
  onSuccess?: () => void
}
