import axiosClient from "./axiosClients";


const bookApi = {
    getBooks: async (query) => {
        const keys = Object.keys(query);
        let params = keys.reduce((acc, key) => {
            const value = query[key];
            if (value) {
                return `${acc}&${key}=${value}`;
            }
            return acc;
        }, '');
        const url = `/books?_limit=4&${params}`;
        console.log("url..", url)
        return axiosClient.get(url);
    },

    getBookById: (id) => {
        const url = `/books/${id}`;
        return axiosClient.get(url);
    },

    getCategories: () => {
        return axiosClient.get("/categories");
    },

    getAuthors: () => {
        return axiosClient.get("/authors");
    },

    getProviders: () => {
        return axiosClient.get("/providers");
    },

    countBook: async (filter) => {
        const keys = Object.keys(filter);
        let params = keys.reduce((acc, key) => {
            const value = filter[key];
            if (value) {
                return `${acc}&${key}=${value}`;
            }
            return acc;
        }, '');
        return await axiosClient.get(`/books/count?${params}`);
    },

    createBook: (data, file) => {
        const formData = new FormData();
        formData.append('data', JSON.stringify(data));
        if (file) {
            formData.append('files.photo', file);
        }
        return axiosClient.post('/books', formData);
    },

    updateBook: (data, file, id) => {
        const formData = new FormData();
        formData.append('data', JSON.stringify(data));
        if (file) {
            formData.append('files.photo', file);
        }
        return axiosClient.put(`/books/${id}`, formData);
    },
    deleteBook: (id) => {
        const url = `/books/${id}`;
        return axiosClient.delete(url);
    }
}

export default bookApi;
