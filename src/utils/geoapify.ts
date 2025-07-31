export const getAddressFromCoords = async (lat: number, lon: number) => {
  try {
    const res = await fetch(`https://api.geoapify.com/v1/geocode/reverse?lat=${lat}&lon=${lon}&format=json&apiKey=${process.env.GEOAPIFY_KEY}`)
    const data = await res.json()

   const result = data.results?.[0]

    if (!result) return "Alamat tidak ditemukan"

    const { suburb, city, county, state, postcode ,formatted } = result
    
    console.log(result)
    console.log(result?.formatted)

    // Susun alamat: jika data suburb/city/state tersedia, gabungkan
    const alamat = [suburb, city, county ,state, postcode].filter(Boolean).join(", ")

    return alamat || formatted || "Alamat tidak ditemukan"

  } catch (err) {
    console.error("❌ Gagal ambil alamat dari Geoapify:", err)
  }
}
