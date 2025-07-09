
document.addEventListener('DOMContentLoaded', () => {
    const form = document.querySelector('form');
    const loader = document.querySelector('.loader');
    const errorContainer = document.getElementById('error-container');

    form.addEventListener('submit', async (event) => {
        event.preventDefault();
        
        // Hide previous errors and show loader
        errorContainer.style.display = 'none';
        loader.style.display = 'block';

        const searchTerm = document.querySelector('input[name="search_term"]').value;
        const domain = document.querySelector('select[name="domain"]').value;
        const includeSearchTermInTitle = document.querySelector('input[name="include_search_term_in_title"]').checked;

        try {
            const response = await fetch(`https://render-deploy-7qmw.onrender.com/search?q=${searchTerm}&domain=${domain}`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            let productData = await response.json();

            // Filter: Title must not be 'N/A'
            productData = productData.filter(product => product.Title !== 'N/A');

            if (includeSearchTermInTitle) {
                // Filter: Title must contain the search term (case-insensitive)
                productData = productData.filter(product => product.Title.toLowerCase().includes(searchTerm.toLowerCase()));
            }

            productData.forEach(product => {
                // Clean Rating
                if (product.Rating) {
                    product.Rating = product.Rating.replace('out of 5 stars', '').trim();
                }

                // Clean and convert 'Number of Ratings' to numeric
                if (product['Number of Ratings']) {
                    product['Number of Ratings'] = parseInt(product['Number of Ratings'].replace(/,/g, '').replace('N/A', '0'), 10) || 0;
                } else {
                    product['Number of Ratings'] = 0;
                }

                // Clean 'Sales Past Month'
                if (product['Sales Past Month'] && product['Sales Past Month'].includes('bought in past month')) {
                    product['Sales Past Month'] = product['Sales Past Month'].replace(' bought in past month', '').trim();
                } else {
                    product['Sales Past Month'] = '';
                }
            });

            // Sort by number of ratings descending
            productData.sort((a, b) => b['Number of Ratings'] - a['Number of Ratings']);

            localStorage.setItem('productData', JSON.stringify(productData));
            localStorage.setItem('amazonDomain', domain);
            window.location.href = 'results.html';

        } catch (error) {
            loader.style.display = 'none';
            const errorDiv = document.getElementById('error-container');
            errorDiv.textContent = "Service not available. Try again!";
            errorDiv.style.display = 'block';
        }
    });
});
