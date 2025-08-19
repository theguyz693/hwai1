const carForm = document.getElementById('carForm');
const collectionDiv = document.getElementById('collection');
const errorDiv = document.getElementById('error');
const submitBtn = document.getElementById('submitBtn');
const entryCount = document.getElementById('entryCount');
const filterPack = document.getElementById('filterPack');
const filterCategory = document.getElementById('filterCategory');
const sortOption = document.getElementById('sortOption');

let collection = JSON.parse(localStorage.getItem('hwCollection')) || [];
let favorites = JSON.parse(localStorage.getItem('hwFavorites')) || [];
let editIndex = -1;

function renderCollection() {
  collectionDiv.innerHTML = '';

  let filtered = [...collection];
  const selectedPack = filterPack.value;
  const selectedCategory = filterCategory.value;
  const sortBy = sortOption.value;

  if (selectedPack) filtered = filtered.filter(car => car.packStatus === selectedPack);
  if (selectedCategory) filtered = filtered.filter(car => car.category === selectedCategory);

  // Sorting
  switch (sortBy) {
    case 'name-asc': filtered.sort((a, b) => a.name.localeCompare(b.name)); break;
    case 'name-desc': filtered.sort((a, b) => b.name.localeCompare(a.name)); break;
    case 'rating-desc': filtered.sort((a, b) => b.rating - a.rating); break;
    case 'rating-asc': filtered.sort((a, b) => a.rating - b.rating); break;
    case 'price-desc': filtered.sort((a, b) => b.value - a.value); break;
    case 'price-asc': filtered.sort((a, b) => a.value - b.value); break;
  }

  entryCount.textContent = `Total Items: ${collection.length}`;

  if (filtered.length === 0) {
    collectionDiv.innerHTML = '<p>No cars match this filter.</p>';
    return;
  }

  filtered.forEach((car, index) => {
    const card = document.createElement('div');
    card.className = 'card';

    const favIcon = document.createElement('div');
    favIcon.className = 'favorite-icon';
    favIcon.innerHTML = favorites.includes(car.name) ? '❤️' : '🤍';
    if (favorites.includes(car.name)) favIcon.classList.add('favorited');
    favIcon.onclick = (e) => { e.stopPropagation(); toggleFavorite(car.name); };

    const img = document.createElement('img');
    img.src = car.image; img.alt = car.name;

    const content = document.createElement('div');
    content.className = 'card-content';
    content.innerHTML = `
      <h3>${car.name}</h3>
      <p><b>₹${car.value}</b></p>
      <p>Type: ${car.type || 'N/A'}</p>
      <p>Pack: ${car.packStatus || 'N/A'}</p>
      <p>Category: ${car.category || 'N/A'}</p>
      <div class="rating">${'⭐'.repeat(car.rating || 0)}</div>
    `;

    const btnContainer = document.createElement('div');
    btnContainer.className = 'card-buttons';

    const btnEdit = document.createElement('button');
    btnEdit.className = 'edit';
    btnEdit.textContent = 'Edit';
    btnEdit.onclick = (e) => { e.stopPropagation(); startEdit(index); };

    const btnDelete = document.createElement('button');
    btnDelete.className = 'delete';
    btnDelete.textContent = 'Delete';
    btnDelete.onclick = (e) => { e.stopPropagation(); deleteCar(index); };

    const btnInfo = document.createElement('button');
    btnInfo.className = 'info';
    btnInfo.textContent = 'Info';
    btnInfo.onclick = (e) => {
      e.stopPropagation();
      const link = car.wiki || car.marketplace;
      if (link) window.open(link, '_blank');
      else alert(`No link available for ${car.name}`);
    };

    btnContainer.appendChild(btnEdit);
    btnContainer.appendChild(btnDelete);
    btnContainer.appendChild(btnInfo);

    card.appendChild(favIcon);
    card.appendChild(img);
    card.appendChild(content);
    card.appendChild(btnContainer);

    // Admire mode on card click
    card.addEventListener('click', () => openModal(car));

    collectionDiv.appendChild(card);
  });
}

function toggleFavorite(name) {
  if (favorites.includes(name)) favorites = favorites.filter(f
