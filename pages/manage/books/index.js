import { BASE_URL } from 'api/axiosClients'
import bookApi from 'api/bookApi'
import Layout from 'component/Layout/Layout'
import Loading from 'component/Loading/Loading'
import ModalDeleteBook from 'component/modal/DeleteBook'
import ModalNotify from 'component/modal/NotifyModal'
import BookSearchForm from 'component/book/bookSearchForm'
import Link from 'next/link'
import { useRouter } from 'next/router'
import React, { Fragment, useEffect, useState } from 'react'
import { Button, Table } from 'react-bootstrap'
import NoData from 'component/NoData'

const initFilterState = {
    'name_contains': null,
    'author.name_contains': null,
    'category.id': null
};

const Books = () => {
    const router = useRouter();
    const [showModalDelete, setShowModalDelete] = useState(false);
    const [showModalNotify, setShowModalNotify] = useState(false);
    const [currentBook, setCurrentBook] = useState();
    const [books, setBooks] = useState();
    const page = +router.query.page || 1;
    const [totalPage, setTotalPage] = useState();
    const [loading, setLoading] = useState(false)
    const [hasOnChange, setHasOnChange] = useState(false);
    const [filter, setFilter] = useState(initFilterState);
    const start = page === 1 ? 0 : (page - 1) * 4;

    const selectDocumentHandler = () => {
        setHasOnChange(preState => !preState);
    };
    useEffect(() => {
        handleClickPagination(1);
    }, [filter]);
    useEffect(() => {
        (async () => {
            setLoading(true);
            //Lấy sách theo page, vì strapi version 3. chưa hỗ trợ pagination nên phải làm theo cách start, limit
            const books = await bookApi.getBooks({ "_start": start, _sort: 'id:ASC', ...filter });
            setBooks(books)
            //Tính tổng page
            const numberOfBooks = await bookApi.countBook(filter);
            const totalPage = Math.ceil(numberOfBooks / 4)
            setTotalPage(totalPage)
            setLoading(false)
        })()
    }, [page, hasOnChange, filter])

    //handle open và close modal hỏi xem có muốn xóa sách hay k
    const handleCloseModalDelete = () => setShowModalDelete(false);
    const handleShowModalDelete = () => {
        setShowModalDelete(true);
    }

    //hanlde open và close thông báo không thể xóa sách
    const handleCloseModalNotify = () => setShowModalNotify(false);
    const handleShowModalNotify = () => {
        setShowModalNotify(true);
    }

    //handle click button delete book
    const handleDeleteBook = (id) => {
        setCurrentBook(id);
        //Nếu sách chưa có ai mượn thì cho xóa, ngược lại thì thông báo không đc xóa
        if (!checkIsDelete(id)) {
            handleShowModalDelete();
        } else { handleShowModalNotify(); }

    }

    //hanlde click item pagination
    const handleClickPagination = (pageNext) => {
        if (pageNext > totalPage || pageNext < 1) {
            return;
        }
        router.push(`/manage/books?page=${pageNext}`);
    }

    //kiểm tra xem sách có thuộc phiếu mượn nào không
    const checkIsDelete = (id) => {
        return books.find(book => id === book.id).transaction_details.length > 0;
    }

    //Hiện item pagination
    const itemPagination = () => {

        let list = [];
        for (let i = 0; i < totalPage; i++) {
            list.push(<li key={i} className={page === (i + 1) ? "page-item active" : "page-item"} onClick={() => handleClickPagination(i + 1)}><a className="page-link">{i + 1}</a></li>)
        }
        return list;
    }

    return (
        <Fragment>
            {loading && <Loading />}
            <Layout>
                <h1 className="h3 pt-3 pb-2 mb-3 border-bottom">Books</h1>
                <div className = "d-flex justify-content-end mb-3">
                    <Link href="/manage/books/create">
                        <Button className="btn btn-primary">Create book</Button>
                    </Link>
                </div>
                <BookSearchForm
                  setSearchFilter={setFilter}
                />
                {books && books.length <= 0 && !loading && <NoData />}
                {books && !!books.length && (
                  <Table striped bordered hover>
                    <thead>
                        <tr>
                            <th scope="col">ID</th>
                            <th scope="col">Image</th>
                            <th scope="col">Name</th>
                            <th scope="col">Author</th>
                            <th scope="col">Category</th>
                            <th scope="col">Remain</th>
                            <th scope="col">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {books.map(book => (
                            <tr key={book.id} onClick={() => router.push(`/manage/books/${book.id}`)} style={{ cursor: 'pointer' }}>
                                <th scope="row">{book.id}</th>
                                <th scope="row">
                                    <img src={book.photo ? `${BASE_URL}${book.photo.url}` : "/image/thumbnail.png"} className="img-thumbnail rounded-3"
                                        style={{ width: "100px" }} alt={book.name} />
                                </th>
                                <td>{book.name}</td>
                                <td>{book.author.name}</td>
                                <td>{book.category.name}</td>
                                <td>{book.remain}</td>
                                <td onClick={(e) => e.stopPropagation()}>
                                    <Link href={`/manage/books/update/${book.id}`}>
                                        <button type="button" className="btn btn-sm px-3 btn-warning">
                                            <i className="bi bi-pencil-square"></i>
                                        </button>
                                    </Link>
                                    <button type="button" className="btn btn-danger btn-sm px-3 m-2" onClick={() => handleDeleteBook(book.id)}>
                                        <i className="bi bi-trash"></i>
                                    </button></td>

                            </tr>
                        ))}
                    </tbody>
                </Table>)}
                {!!books?.length && (
                    <nav aria-label="Page navigation">
                        <ul className="pagination">
                            <li className={page <= 1 ? 'page-item disabled' : 'page-item'}
                                onClick={() => handleClickPagination(page - 1)}
                            >
                                <a className="page-link" aria-label="Previous">
                                    <span aria-hidden="true">&laquo;</span>
                                </a>
                            </li>
                            {
                                itemPagination()
                            }
                            <li className={page >= totalPage ? 'page-item disabled' : 'page-item'}
                                onClick={() => handleClickPagination(page + 1)}
                            >
                                <a className="page-link" aria-label="Next">
                                    <span aria-hidden="true">&raquo;</span>
                                </a>
                            </li>
                        </ul>
                    </nav>)}
                <ModalDeleteBook
                    showModalDelete={showModalDelete}
                    handleCloseModalDelete={handleCloseModalDelete}
                    idBook={currentBook}
                    selectDocumentHandler={selectDocumentHandler}
                />
                <ModalNotify
                    showModal={showModalNotify}
                    closeModal={handleCloseModalNotify}
                    content={{
                        title: "Can't delete book",
                        message: `Book id: ${currentBook} has transaction.
                     Please delete transaction before`
                    }}
                />
            </Layout >
        </Fragment >
    )
}

export default Books
