Create script to call this API in index.html and display results in results.html

params = {
    "q": search_term,
    "domain": domain
}
product_data = requests.get("http://192.168.0.161:5000/search", params=params)

include_search_term_in_title = request.form.get('include_search_term_in_title') == 'true'

# if product_data:
df = pd.DataFrame(product_data)
# Filter: Title must not be 'N/A'
df = df[df['Title'] != 'N/A']

if include_search_term_in_title:
    # Filter: Title must contain the search term (case-insensitive)
    df = df[df['Title'].str.contains(search_term, case=False)]

df['Rating'] = df['Rating'].str.replace('out of 5 stars','')

# Clean and convert 'Number of Ratings' to numeric
df['Number of Ratings'] = df['Number of Ratings'].str.replace(',', '').replace('N/A', '0')
df['Number of Ratings'] = pd.to_numeric(df['Number of Ratings'], errors='coerce').fillna(0).astype(int)

df['Sales Past Month'] = np.where(
    df['Sales Past Month'].str.contains('bought in past month', na=False),
    df['Sales Past Month'].str.replace(' bought in past month', '', regex=False),
    ''
)

# Sort by number of ratings descending
df = df.sort_values(by='Number of Ratings', ascending=False)