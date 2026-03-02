# Test Image Proxy

## Test URL
```
https://api.facejob.ma/api/v1/proxy-image?url=https%3A%2F%2Flh3.googleusercontent.com%2Fa%2FACg8ocJaqi7kao5kIzGAydYa0K30bhTjQ6JneGQlVq0husEziVcInKsx%3Ds200-c
```

## Decoded URL
```
https://lh3.googleusercontent.com/a/ACg8ocJaqi7kao5kIzGAydYa0K30bhTjQ6JneGQlVq0husEziVcInKsx=s200-c
```

## How to Test

### 1. Test Backend Proxy Directly
Open the proxy URL in your browser or use curl:
```bash
curl -v "https://api.facejob.ma/api/v1/proxy-image?url=https%3A%2F%2Flh3.googleusercontent.com%2Fa%2FACg8ocJaqi7kao5kIzGAydYa0K30bhTjQ6JneGQlVq0husEziVcInKsx%3Ds200-c"
```

### 2. Check Backend Logs
Look for logs in Laravel:
```bash
tail -f storage/logs/laravel.log
```

Look for these log entries:
- `[INFO] Image proxy request received`
- `[INFO] Image proxy: Checking domain`
- `[INFO] Image proxy: Domain allowed`
- `[INFO] Image proxy: Fetching image from external source`
- `[INFO] Image proxy: Response received`
- `[INFO] Image proxy: Returning image`

### 3. Test Frontend Download
1. Go to `/dashboard/entreprise/consumed-cvs` or `/dashboard/entreprise/mes-offres/[id]`
2. Click "Télécharger CV" for a candidate with Google profile image
3. Open browser console (F12)
4. Look for logs starting with `[PDF]`:
   - `[PDF] Starting image load process`
   - `[PDF] Image type detected`
   - `[PDF] Using proxy URL`
   - `[PDF] Fetching image via proxy...`
   - `[PDF] Proxy response received`
   - `[PDF] Converting image to blob...`
   - `[PDF] Blob created`
   - `[PDF] Image converted to base64`

## Expected Behavior

### Success Case
1. Backend logs show successful image fetch
2. Frontend console shows:
   - Proxy response status: 200
   - Blob size > 0
   - Base64 conversion successful
3. PDF downloads with profile image visible

### Failure Case
1. Backend logs show error (domain not allowed, fetch failed, etc.)
2. Frontend console shows:
   - Proxy response status: 4xx or 5xx
   - Error details logged
   - Falls back to default avatar
3. PDF downloads with green default avatar

## Common Issues

### Issue 1: Domain Not Allowed
**Symptom**: Backend log shows "Domain not allowed"
**Solution**: Add domain to whitelist in `ImageProxyController.php`

### Issue 2: Timeout
**Symptom**: Request takes > 15-20 seconds
**Solution**: Image source is too slow, increase timeout or use default avatar

### Issue 3: CORS Error
**Symptom**: Browser console shows CORS error
**Solution**: Ensure proxy returns `Access-Control-Allow-Origin: *` header

### Issue 4: Invalid Image Format
**Symptom**: Image fetched but not displayed in PDF
**Solution**: Check content-type header and blob type

## Debug Checklist

- [ ] Backend proxy endpoint is accessible
- [ ] Domain is in whitelist
- [ ] Image URL is properly encoded
- [ ] Backend can fetch from Google
- [ ] Frontend receives 200 response
- [ ] Blob is created successfully
- [ ] Base64 conversion works
- [ ] PDF generation includes image
