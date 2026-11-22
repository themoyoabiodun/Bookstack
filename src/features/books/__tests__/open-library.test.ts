import { mapSearchDoc } from '../open-library';

describe('mapSearchDoc', () => {
  it('maps an Open Library search doc to a book', () => {
    expect(
      mapSearchDoc({
        key: '/works/OL1W',
        title: 'Things Fall Apart',
        author_name: ['Chinua Achebe'],
        cover_i: 123,
        number_of_pages_median: 209,
        isbn: ['9780385474542'],
      }),
    ).toEqual({
      openLibraryKey: '/works/OL1W',
      title: 'Things Fall Apart',
      author: 'Chinua Achebe',
      coverUrl: 'https://covers.openlibrary.org/b/id/123-L.jpg',
      pageCount: 209,
      isbn: '9780385474542',
    });
  });

  it('handles missing optional fields', () => {
    const book = mapSearchDoc({ key: '/works/OL2W', title: 'Untitled' });
    expect(book.author).toBe('Unknown author');
    expect(book.coverUrl).toBeNull();
    expect(book.pageCount).toBeNull();
  });
});
