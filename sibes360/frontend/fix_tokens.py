import os

files = ['AsistenciaPadre.jsx', 'NotasPadre.jsx', 'ConductaPadre.jsx', 'PagosPadre.jsx']
base_dir = r"c:\Users\juan9\OneDrive\Desktop\ciclo 7\SISTEMAS DE INFORMACION\SIBES360\Sistemas_Informacion\sibes360\frontend\src\pages\portal"

for name in files:
    fpath = os.path.join(base_dir, name)
    content = open(fpath, "r", encoding="utf-8").read()
    
    # Update the local storage key
    new_content = content.replace("localStorage.getItem('token')", "localStorage.getItem('sibes360_token')")
    open(fpath, "w", encoding="utf-8").write(new_content)

print("Done updating localstorage keys.")
