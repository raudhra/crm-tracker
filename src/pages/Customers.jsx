import { useState, useEffect } from 'react'
import { getCustomersWithDetails } from '../services/api'

function Customers() {
    const [customers , setCustomers] = useState([])
    const [loading , setLoading] = useState(true)
    const [filter, setFilter] = useState('All')
    const [search , setSearch] = useState('')
    const [addCustomer, setAddCustomer] = useState(false)

    useEffect(() => {
        const fetchCustomers = async () => {
            const data = await getCustomersWithDetails();
            setCustomers(data);
        };

        fetchCustomers();

    }, []);

    const filteredCustomers = customers.filter(customer => {
        const matchesSearch = customer.name.toLowerCase().includes(search.toLowerCase())
        const matchesStatus = filter === 'All' || customer.status === filter
        return matchesSearch && matchesStatus
    }
    );
    return (
            <div>
                    <AddCustomerModal
            isOpen={addCustomer}
            onClose={() => setAddCustomer(false)}
            onSubmit={(newCustomer) => {
                setCustomers([...customers, { ...newCustomer, id: Date.now() }])
                setAddCustomer(false)
            }}
            />
            <div className="flex items-center justify-between mb-8">
                <h1 className="text-2xl font-bold text-gray-800">
                    Customers
                </h1>
                <p className="text-gray-500 text-sm mt-1">Here! Your Customers</p>
            </div>
            <div className ="flex items-center gap-3 mb-6">
                <input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder = "Search Customers..."
                    className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-indigo-500 w-64"
                    />
                    {['All', 'Active', 'Pending', 'Inactive'].map(status => (
                        <button
                            key={status}
                            onClick={() => setFilter(status)}
                            className={filter === status ? 'px-3 py-2 text-sm rounded-lg bg-indigo-600 text-white font-medium' : 
                                'px-3 py-2 text-sm rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200'}
                            > {status} </button>
                    ))}
                    <button
                    onClick={(e) => setAddCustomer(true)}
                    className="ml-auto bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700" > Add Customer </button>
            </div>
            <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
                <table className="w-full border-collapse">
                    <thead className="bg-gray-50 text-xs text-gray-500 uppercase tracking-wide">
                        <tr className="bg-gray-50 text-xs text-gray-500 uppercase tracking-wide">
                            <th className="px-4 py-3 text-left font-medium">Profile</th>
                            <th className="px-4 py-3 text-left font-medium">Name + Email</th>
                            <th className="px-4 py-3 text-left font-medium">Phone</th>
                            <th className="px-4 py-3 text-left font-medium">Status</th>
                            <th className="px-4 py-3 text-left font-medium">Last Contact</th>
                            <th className="px-4 py-3 text-left font-medium">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredCustomers.map(customer => (
                            <tr key = {customer.id} className="border-b border-gray-50 hover:bg-gray-50 transition">
                                <td className="px-4 py-3">
                                    {customer.avatar ? (
                                    <img src={customer.avatar} 
                                    alt="customer.name" 
                                    className="w-10 h-10 rounded-full object-cover" 
                                        />
                                    ) : (
                                    <div className="w-10 h-10 rounded-full bg-blue-500 text-white flex items-center justify-center">
                                            {customer.name[0].toUpperCase()}
                                    </div>
                                    )    }
                                </td>
                                <td className="px-4 py-3">
                                    <p className="font-medium text-gray-800">{customer.name}</p>
                                    <p className="text-xs text-gray-400">{customer.email}</p>
                                </td>
                                <td className="px-4 py-3">{customer.phone}</td>
                                <td className="px-4 py-3"><span className={`text-xs px-2 py-1 rounded-full font-medium ${customer.status === 'Active' ? 'bg-green-50 text-green-600' : customer.status === 'Pending' ? 'bg-yellow-50 text-yellow-600' : 'bg-gray-100 text-gray-500'}`}>{customer.status}</span></td>
                                <td className="px-4 py-3">{customer.lastContact}</td>
                                <td className="px-4 py-3"><button>:</button></td>
                            </tr>
                        ))
                    }
                    </tbody>
                </table>
                
            </div> 
        </div>
    )
    
}
function AddCustomerModal({isOpen, onClose, onSubmit }) {
    const [name, setName] = useState('')
    const [email, setEmail] = useState('')
        if (!isOpen) return null
            return (
                <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
                    <div className="bg-white rounded-xl p-6 w-full max-w-md">
                            <h2 className="text-lg font-semibold text-gray-800 mb-4">Add Custom</h2>
                                <input className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm mb-3 focus:outline-none focus:ring-2 focus:ring-indigo-500" value = {name} onChange={(e) => setName(e.target.value)} placeholder="Full Name" />
                                <input className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm mb-3 focus:outline-none focus:ring-2 focus:ring-indigo-500" value = {email} onChange = {(e) => setEmail(e.target.value)} placeholder = "Email" />
                                <div className="flex gap-3 mt-4" >
                                <button className="flex-1 px-4 py-2 rounded-lg border border-gray-200 text-sm text-gray-600 hover:bg-gray-50"  onClick={onClose}>Cancel</button>
                                <button className="flex-1 px-4 py-2 rounded-lg bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700" onClick={() => onSubmit({ name, email})}>Save</button>
                                </div>
                        </div>
                    </div>
             )
     }
                
export default Customers;