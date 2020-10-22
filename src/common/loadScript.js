export default function loadScript(url, callback) {
  const scriptID = url
    .replace('https://', '')
    .replace('http://', '')
    .replace('/', '')
    .replace('.', '')
    .replace('#', '')
  const existingScript = document.getElementById(scriptID)
  if (!existingScript) {
    const script = document.createElement('script')
    script.src = url
    script.id = scriptID
    script.async = 1
    document.body.appendChild(script)
    script.onload = () => {
      if (callback) callback()
    }
  } else if (callback) {
    callback()
  }
}
