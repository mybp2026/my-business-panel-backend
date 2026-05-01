export interface ExchangeRate {
  exchange_rate_id: string;
  from_currency_id: number;
  to_currency_id: number;
  rate: string | number;
  effective_date: string;
  source: string | null;
  created_at: string;
  updated_at: string;
}

export interface ExchangeRateWithCurrencies extends ExchangeRate {
  from_currency_code: string;
  from_currency_name?: string;
  from_currency_symbol: string;
  to_currency_code: string;
  to_currency_name?: string;
  to_currency_symbol: string;
}
