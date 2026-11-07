// Add your personal images to /images using the filenames in README.md.
// Until an image is found, an accessible photo placeholder remains visible.
document.querySelectorAll('[data-photo]').forEach(el=>{const file=el.dataset.photo;if(!file)return;const img=document.createElement('img');img.src='images/'+encodeURIComponent(file);img.alt=el.dataset.alt||'Personal photograph';img.loading='lazy';img.onerror=()=>img.remove();el.prepend(img);});
const y=document.getElementById('year');if(y)y.textContent=new Date().getFullYear();
