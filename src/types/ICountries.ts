export interface ICountry {
  name: string // Название страны
  alpha_2: string // Двухбуквенный ISO-код (например, "GB")
  region: string // Регион (например, "Europe")
  dial_code: string // Телефонный код (например, "+44")
  phone_mask: string // Маска номера телефона (например, "9999999999")
  technical_name: string // Техническое имя (например, "united_kingdom")
  default_currency_code: string // Код валюты (например, "GBP")
}
