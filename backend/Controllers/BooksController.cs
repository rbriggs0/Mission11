using backend.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace backend.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class BooksController : ControllerBase
    {
        private readonly BookstoreContext _context;

        public BooksController(BookstoreContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<Book>>> GetBooks()
        {
            var books = await _context.Books.ToListAsync();
            return Ok(books);
        }

        [HttpGet("{id:int}")]
        public async Task<ActionResult<Book>> GetBook(int id)
        {
            var book = await _context.Books.FindAsync(id);
            if (book == null)
            {
                return NotFound();
            }

            return Ok(book);
        }

        [HttpPost]
        public async Task<ActionResult<Book>> CreateBook([FromBody] Book book)
        {
            if (!TryValidateBook(book, out var error))
            {
                return BadRequest(error);
            }

            book.BookID = 0;
            _context.Books.Add(book);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetBook), new { id = book.BookID }, book);
        }

        [HttpPut("{id:int}")]
        public async Task<IActionResult> UpdateBook(int id, [FromBody] Book book)
        {
            if (id != book.BookID)
            {
                return BadRequest("Route id does not match book id.");
            }

            if (!TryValidateBook(book, out var error))
            {
                return BadRequest(error);
            }

            var existing = await _context.Books.FindAsync(id);
            if (existing == null)
            {
                return NotFound();
            }

            existing.Title = book.Title;
            existing.Author = book.Author;
            existing.Publisher = book.Publisher;
            existing.ISBN = book.ISBN;
            existing.Classification = book.Classification;
            existing.Category = book.Category;
            existing.PageCount = book.PageCount;
            existing.Price = book.Price;

            await _context.SaveChangesAsync();
            return NoContent();
        }

        [HttpDelete("{id:int}")]
        public async Task<IActionResult> DeleteBook(int id)
        {
            var book = await _context.Books.FindAsync(id);
            if (book == null)
            {
                return NotFound();
            }

            _context.Books.Remove(book);
            await _context.SaveChangesAsync();
            return NoContent();
        }

        private static bool TryValidateBook(Book book, out string error)
        {
            error = "";
            if (string.IsNullOrWhiteSpace(book.Title))
            {
                error = "Title is required.";
                return false;
            }

            if (string.IsNullOrWhiteSpace(book.Author))
            {
                error = "Author is required.";
                return false;
            }

            if (string.IsNullOrWhiteSpace(book.Publisher))
            {
                error = "Publisher is required.";
                return false;
            }

            if (string.IsNullOrWhiteSpace(book.ISBN))
            {
                error = "ISBN is required.";
                return false;
            }

            if (string.IsNullOrWhiteSpace(book.Classification))
            {
                error = "Classification is required.";
                return false;
            }

            if (string.IsNullOrWhiteSpace(book.Category))
            {
                error = "Category is required.";
                return false;
            }

            if (book.PageCount <= 0)
            {
                error = "Page count must be greater than zero.";
                return false;
            }

            if (book.Price < 0)
            {
                error = "Price cannot be negative.";
                return false;
            }

            return true;
        }
    }
}
