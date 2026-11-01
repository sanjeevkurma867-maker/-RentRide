import bcrypt from 'bcryptjs';
import { db } from './db.js';

const hash = bcrypt.hashSync('Demo@123', 10);
const addUser = db.prepare('INSERT OR IGNORE INTO users (name,email,password,role,phone,avatar) VALUES (?,?,?,?,?,?)');
addUser.run('Aarav Sharma','renter@demo.com',hash,'renter','+91 98765 43210','https://i.pravatar.cc/120?img=12');
addUser.run('Maya Reddy','owner@demo.com',hash,'owner','+91 98765 43211','https://i.pravatar.cc/120?img=47');
const owners = [
 ['Kiran Rao','kiran@rentride.demo'],['Sana Khan','sana@rentride.demo'],['Vikram Reddy','vikram@rentride.demo'],['Priya Nair','priya@rentride.demo'],['Arjun Mehta','arjun@rentride.demo'],['Isha Varma','isha@rentride.demo'],['Dev Patel','dev@rentride.demo'],['Ananya Das','ananya@rentride.demo'],['Rahul Menon','rahul@rentride.demo'],['Zoya Ali','zoya@rentride.demo']
];
owners.forEach(([name,email],i)=>addUser.run(name,email,hash,'owner',`+91 90000 1000${i}`,`https://i.pravatar.cc/120?img=${30+i}`));
const locations = [
 ['Jubilee Hills',17.4326,78.4071],['Banjara Hills',17.4126,78.4482],['Hitech City',17.4435,78.3772],['Gachibowli',17.4401,78.3489],['Madhapur',17.4483,78.3915],['Kondapur',17.4697,78.3578],['Begumpet',17.4448,78.4664],['Secunderabad',17.4399,78.4983],['Himayatnagar',17.4059,78.4814],['Kukatpally',17.4849,78.4138]
];
const categories = [
 {name:'Cars',list:[['Hyundai Creta','Hyundai',5,190],['Honda City','Honda',5,150],['Maruti Swift','Maruti',5,95],['Toyota Fortuner','Toyota',7,340],['Tata Nexon EV','Tata',5,180],['Volkswagen Polo','Volkswagen',5,110],['Kia Seltos','Kia',5,210],['Skoda Slavia','Skoda',5,165]]},
 {name:'SUVs',list:[['Mahindra XUV700','Mahindra',7,280],['Jeep Compass','Jeep',5,310],['Toyota Innova Crysta','Toyota',7,260],['MG Hector','MG',5,230],['Hyundai Tucson','Hyundai',5,350],['Tata Harrier','Tata',5,240],['Kia Carnival','Kia',7,390],['Isuzu D-Max','Isuzu',5,270]]},
 {name:'Bikes',list:[['Royal Enfield Classic 350','Royal Enfield',2,75],['KTM Duke 390','KTM',2,110],['Yamaha R15','Yamaha',2,80],['Honda CB350','Honda',2,85],['Triumph Speed 400','Triumph',2,140],['Jawa 42','Jawa',2,95],['TVS Apache RTR','TVS',2,70],['Royal Enfield Himalayan','Royal Enfield',2,125]]},
 {name:'Scooters',list:[['Ather 450X','Ather',2,65],['Vespa SXL','Vespa',2,60],['Honda Activa 6G','Honda',2,40],['TVS iQube','TVS',2,55],['Suzuki Access 125','Suzuki',2,45],['Ola S1 Pro','Ola',2,55],['Yamaha Fascino','Yamaha',2,48],['Bajaj Chetak','Bajaj',2,52]]},
 {name:'Bicycles',list:[['Trek Marlin 7','Trek',1,30],['Giant Escape 3','Giant',1,25],['Firefox Rapide','Firefox',1,20],['Cannondale Trail 5','Cannondale',1,35],['Hero Sprint Pro','Hero',1,15],['Polygon Heist X2','Polygon',1,28],['Btwin Riverside 500','Btwin',1,22],['Scott Aspect 950','Scott',1,34]]},
 {name:'Vans and Cargo',list:[['Force Traveller','Force',12,420],['Tata Ace Gold','Tata',2,180],['Maruti Eeco Cargo','Maruti',2,145],['Mahindra Bolero Pickup','Mahindra',2,210],['Ashok Leyland Dost','Ashok Leyland',2,220],['Tata Winger','Tata',10,360],['Isuzu S-Cab','Isuzu',2,240],['Mahindra Supro','Mahindra',2,175]]}
];
const photos = {
 'Cars':['photo-1492144534655-ae79c964c9d7','photo-1503376780353-7e6692767b70','photo-1549317661-bd32c8ce0db2','photo-1552519507-da3b142c6e3d','photo-1502877338535-766e1452684a','photo-1533473359331-0135ef1b58bf','photo-1511919884226-fd3cad34687c','photo-1494976388531-d1058494cdd8'],
 'SUVs':['photo-1519641471654-76ce0107ad1b','photo-1519608487953-e999c86e7455','photo-1519583272095-6433daf26b6e','photo-1533473359331-0135ef1b58bf','photo-1519641471654-76ce0107ad1b','photo-1519608487953-e999c86e7455','photo-1519583272095-6433daf26b6e','photo-1533473359331-0135ef1b58bf'],
 'Bikes':['photo-1558981806-ec527fa84c39','photo-1558981403-c5f9899a28bc','photo-1558981806-ec527fa84c39','photo-1558981403-c5f9899a28bc','photo-1558981806-ec527fa84c39','photo-1558981403-c5f9899a28bc','photo-1558981806-ec527fa84c39','photo-1558981403-c5f9899a28bc'],
 'Scooters':['photo-1558981806-ec527fa84c39','photo-1558981403-c5f9899a28bc','photo-1558981806-ec527fa84c39','photo-1558981403-c5f9899a28bc','photo-1558981806-ec527fa84c39','photo-1558981403-c5f9899a28bc','photo-1558981806-ec527fa84c39','photo-1558981403-c5f9899a28bc'],
 'Bicycles':['photo-1485965120184-e220f721d03e','photo-1511994298241-608e28f14fde','photo-1485965120184-e220f721d03e','photo-1511994298241-608e28f14fde','photo-1485965120184-e220f721d03e','photo-1511994298241-608e28f14fde','photo-1485965120184-e220f721d03e','photo-1511994298241-608e28f14fde'],
 'Vans and Cargo':['photo-1566933293069-b55c7f326dd4','photo-1601584115197-04ecc0da31d7','photo-1566933293069-b55c7f326dd4','photo-1601584115197-04ecc0da31d7','photo-1566933293069-b55c7f326dd4','photo-1601584115197-04ecc0da31d7','photo-1566933293069-b55c7f326dd4','photo-1601584115197-04ecc0da31d7']
};
const insertVehicle = db.prepare(`INSERT INTO vehicles(owner_id,name,category,brand,model_year,price,location,lat,lng,description,image,images,seats,transmission,fuel,available) VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,1)`);
const existing = db.prepare('SELECT COUNT(*) n FROM vehicles').get().n;
if (existing < 60) {
 const transaction = db.transaction(()=> {
  categories.forEach((category,ci)=>category.list.forEach((item,vi)=> {
   const [name,brand,seats,price]=item; const loc=locations[(ci*3+vi)%locations.length];
   const photo=`https://images.unsplash.com/${photos[category.name][vi]}?auto=format&fit=crop&w=1200&q=85`;
   insertVehicle.run(3+((ci*2+vi)%10),name,category.name,brand,2021+(vi%5),price+((vi%3)*5),loc[0],loc[1]+((vi%3)*.003),loc[2]+((ci%3)*.002),`A well maintained ${name}, ready for your next Hyderabad adventure. Clean, reliable and available for flexible hourly rentals.`,photo,JSON.stringify([photo,photo]),seats,ci<2?'Automatic':'Manual',ci===4||ci===3?'Electric':'Petrol');
  }));
 }); transaction();
}
const renter=db.prepare("SELECT id FROM users WHERE email='renter@demo.com'").get().id;
const vehicle=db.prepare('SELECT id,price FROM vehicles ORDER BY id LIMIT 1').get();
if (!db.prepare('SELECT id FROM bookings LIMIT 1').get()) {
 const date=new Date(Date.now()+86400000).toISOString();
 db.prepare('INSERT INTO bookings(vehicle_id,renter_id,start_at,hours,total,status) VALUES(?,?,?,?,?,?)').run(vehicle.id,renter,date,3,vehicle.price*3,'pending');
}
console.log('Seed complete: 12 demo users, 60 Hyderabad vehicles, sample booking.');
