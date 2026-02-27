export interface TradePanelProps {
  symbol?: string
  currentPrice?: number
  availableCash?: number
  positionQty?: number
  onSuccess?: () => void
}