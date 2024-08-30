import React from 'react'
import './Admin.css'
import {Routes,Route} from 'react-router-dom'
import Slidebar from '../../Components/Slidebar/Slidebar'
import ListProduct from '../../Components/ListProduct/ListProduct'
import Addproduct from '../../Components/AddProduct/AddProduct'
//import ListProfduct from '../../Components/ListProduct/ListProduct'

const Admin = () => {
  return (
    <div className='admin'>
      <Slidebar/>
      <Routes>
        <Route path='/addproduct' element={<Addproduct/>}/>
        <Route path='/listproduct' element={<ListProduct/>}/>
      </Routes>

    </div>
  )
}

export default Admin  