import bcrypt from 'bcryptjs';
import { db } from './db.js';
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { refreshTrust, computeOwnerTrust } from './utils/trust.js';

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
   insertVehicle.run(2+((ci*2+vi)%11),name,category.name,brand,2021+(vi%5),price+((vi%3)*5),loc[0],loc[1]+((vi%3)*.003),loc[2]+((ci%3)*.002),`A well maintained ${name}, ready for your next Hyderabad adventure. Clean, reliable and available for flexible hourly rentals.`,photo,JSON.stringify([photo,photo]),seats,ci<2?'Automatic':'Manual',ci===4||ci===3?'Electric':'Petrol');
  }));
 }); transaction();
}
const renter=db.prepare("SELECT id FROM users WHERE email='renter@demo.com'").get().id;
// Extra historical demo renters and verified profile metadata.
const extraRenters=[['Rahul Verma','renter1@demo.com'],['Divya Menon','renter2@demo.com'],['Faisal Ali','renter3@demo.com'],['Pooja Iyer','renter4@demo.com'],['Naveen Reddy','renter5@demo.com']];
extraRenters.forEach(([name,email])=>addUser.run(name,email,hash,'renter','',`https://i.pravatar.cc/120?img=${18+extraRenters.findIndex(x=>x[1]===email)}`));
const setDemo=db.prepare("UPDATE users SET is_demo=CASE WHEN email LIKE '%@demo.com' OR email LIKE '%@rentride.demo' THEN 1 ELSE 0 END");setDemo.run();extraRenters.forEach(([_,email])=>db.prepare('UPDATE users SET is_demo=0 WHERE email=?').run(email));
db.prepare("UPDATE users SET phone='9876500001',phone_verified=1,license_no='TS09 20190012345' WHERE email='renter@demo.com'").run();
db.prepare("UPDATE users SET phone='9876500002',phone_verified=1 WHERE email='owner@demo.com'").run();
db.prepare("UPDATE users SET phone_verified=1 WHERE role='owner' AND id%4<>0").run();
db.prepare("UPDATE vehicles SET registration_no='TS09RR'||printf('%06d',id) WHERE registration_no IS NULL").run();
// Ensure the primary demo owner has one vehicle in every category for the walkthrough.
const primaryOwner=db.prepare("SELECT id FROM users WHERE email='owner@demo.com'").get().id;
for(const category of ['Cars','SUVs','Bikes','Scooters','Bicycles','Vans and Cargo'])if(!db.prepare('SELECT id FROM vehicles WHERE owner_id=? AND category=?').get(primaryOwner,category)){const src=db.prepare('SELECT * FROM vehicles WHERE category=? LIMIT 1').get(category);db.prepare('INSERT INTO vehicles(owner_id,name,category,brand,model_year,price,location,lat,lng,description,image,images,seats,transmission,fuel,available,registration_no,rating) VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)').run(primaryOwner,`Demo ${src.name}`,src.category,src.brand,src.model_year,src.price,src.location,src.lat,src.lng,src.description,src.image,src.images,src.seats,src.transmission,src.fuel,1,`TS09RR${String(100000+src.id).slice(-6)}`,4.7)}
const vehicle=db.prepare('SELECT id,price FROM vehicles ORDER BY id LIMIT 1').get();
if (!db.prepare('SELECT id FROM bookings LIMIT 1').get()) {
 const date=new Date(Date.now()+86400000).toISOString();
 db.prepare('INSERT INTO bookings(vehicle_id,renter_id,start_at,hours,total,status) VALUES(?,?,?,?,?,?)').run(vehicle.id,renter,date,3,vehicle.price*3,'pending');
}
// One repeatable set of historical activity for trust tiers.
if (!db.prepare("SELECT id FROM bookings WHERE status='completed' LIMIT 1").get()) {
 const renters=[renter,...extraRenters.map(([_,email])=>db.prepare('SELECT id FROM users WHERE email=?').get(email).id)];
 const owners=db.prepare("SELECT id FROM users WHERE role='owner'").all();
 const statuses=[['completed',14,1,0],['completed',11,2,1],['completed',8,2,1],['completed',6,3,1],['completed',9,1,0],['completed',5,3,2],['completed',3,4,1],['completed',12,1,1],['completed',7,2,0],['completed',2,5,2],['completed',4,1,0]];
 owners.forEach((o,index)=>{const counts=statuses[index]||statuses[10],vs=db.prepare('SELECT id,price FROM vehicles WHERE owner_id=?').all(o.id);if(!vs.length)return;for(let i=0;i<counts[1]+counts[2]+counts[3];i++){const status=i<counts[1]?'completed':i<counts[1]+counts[2]?'rejected':'cancelled',v=vs[i%vs.length],start=new Date(Date.UTC(2026,8,1+(i*3)%55,10)).toISOString();db.prepare('INSERT INTO bookings(vehicle_id,renter_id,start_at,hours,total,status,rate_per_hour,list_price_per_hour,handover_state) VALUES(?,?,?,?,?,?,?,?,?)').run(v.id,renters[(i+index)%renters.length],start,2+i%7,v.price*(2+i%7),status,v.price,v.price,status==='completed'?'returned':'none');if(status==='completed')db.prepare('INSERT INTO reviews(vehicle_id,renter_id,stars,comment) VALUES(?,?,?,?)').run(v.id,renters[(i+index)%renters.length],index%4===0?5:4,'Great ride and easy pickup.')}})
}
const base=path.dirname(fileURLToPath(import.meta.url));
const explicitSeedRun=process.argv[1]?.endsWith('/server/seed.js');
const liveSample=explicitSeedRun?db.prepare("SELECT b.id FROM bookings b JOIN vehicles v ON v.id=b.vehicle_id WHERE v.owner_id=? AND b.renter_id=? AND v.category='Scooters' AND b.start_at>datetime('now') ORDER BY b.id LIMIT 1").get(primaryOwner,renter):null;if(liveSample){db.prepare('DELETE FROM handover_checks WHERE booking_id=?').run(liveSample.id);fs.rmSync(path.join(base,'..','public','uploads','handover',String(liveSample.id)),{recursive:true,force:true});db.prepare("UPDATE bookings SET status='accepted',handover_state='pickup_pending' WHERE id=?").run(liveSample.id)}
// Rebuild the primary demo storyline once: live pickup, completed report, pending request.
if(!db.prepare("SELECT b.id FROM bookings b JOIN vehicles v ON v.id=b.vehicle_id WHERE v.owner_id=? AND b.status='completed' AND b.offer_id IS NOT NULL LIMIT 1").get(primaryOwner)){
 const renterIds=[renter,...extraRenters.map(([_,email])=>db.prepare('SELECT id FROM users WHERE email=?').get(email).id)],scooter=db.prepare("SELECT id,price FROM vehicles WHERE owner_id=? AND category='Scooters' LIMIT 1").get(primaryOwner),car=db.prepare("SELECT id,price,name FROM vehicles WHERE owner_id=? AND category='Cars' LIMIT 1").get(primaryOwner),suv=db.prepare("SELECT id,price FROM vehicles WHERE owner_id=? AND category='SUVs' LIMIT 1").get(primaryOwner);
 const tomorrow=new Date();tomorrow.setDate(tomorrow.getDate()+1);tomorrow.setHours(10,0,0,0);const twoDays=new Date(Date.now()-2*86400000).toISOString();
 const liveId=Number(db.prepare('INSERT INTO bookings(vehicle_id,renter_id,start_at,hours,total,status,rate_per_hour,list_price_per_hour,handover_state) VALUES(?,?,?,?,?,?,?,?,?)').run(scooter.id,renter, tomorrow.toISOString(),3,scooter.price*3,'accepted',scooter.price,scooter.price,'pickup_pending').lastInsertRowid);
 const convoId=Number(db.prepare('INSERT INTO conversations(vehicle_id,renter_id,owner_id) VALUES(?,?,?)').run(car.id,renter,primaryOwner).lastInsertRowid),p1=Math.max(5,Math.round(car.price*.8/5)*5),p2=Math.max(p1+1,Math.round(car.price*.9/5)*5),exp=new Date(Date.now()+86400000).toISOString().replace('T',' ').slice(0,19);
 const offer1=Number(db.prepare("INSERT INTO offers(conversation_id,vehicle_id,renter_id,owner_id,created_by,price_per_hour,list_price_per_hour,hours,status,expires_at) VALUES(?,?,?,?,?,?,?,?,?,?)").run(convoId,car.id,renter,primaryOwner,renter,p1,car.price,4,'countered',exp).lastInsertRowid);
 const offer2=Number(db.prepare("INSERT INTO offers(conversation_id,vehicle_id,renter_id,owner_id,created_by,price_per_hour,list_price_per_hour,hours,status,parent_offer_id,expires_at,responded_at) VALUES(?,?,?,?,?,?,?,?,?,?,?,datetime('now'))").run(convoId,car.id,renter,primaryOwner,primaryOwner,p2,car.price,4,'used',offer1,exp).lastInsertRowid);
 [['offer',renter,'Offer: ₹'+p1+'/hr',offer1],['offer',primaryOwner,'Offer: ₹'+p2+'/hr',offer2],['system',renter,'Renter accepted the offer of ₹'+p2+'/hr',null]].forEach(([kind,sender,body,oid])=>db.prepare('INSERT INTO messages(vehicle_id,sender_id,recipient_id,body,kind,offer_id) VALUES(?,?,?,?,?,?)').run(car.id,sender,sender===renter?primaryOwner:renter,body,kind,oid));
 const completedId=Number(db.prepare('INSERT INTO bookings(vehicle_id,renter_id,start_at,hours,total,status,rate_per_hour,list_price_per_hour,offer_id,handover_state) VALUES(?,?,?,?,?,?,?,?,?,?)').run(car.id,renter,twoDays,4,p2*4,'completed',p2,car.price,offer2,'returned').lastInsertRowid);
 const folder=path.join(base,'..','public','uploads','handover',String(completedId));fs.mkdirSync(folder,{recursive:true});
 for(const [stage,odo,level,damage] of [['pickup',41250,80,''],['return',41268,55,'Small scuff on rear bumper, left side, about 3 cm']]){const checkId=Number(db.prepare("INSERT INTO handover_checks(booking_id,stage,recorded_by,odometer_km,level_percent,checklist,notes,damage_notes,status,responded_by,response_note,responded_at) VALUES(?,?,?,?,?,?,?,?, 'confirmed',?,?,datetime('now'))").run(completedId,stage,primaryOwner,odo,level,JSON.stringify({documents_checked:true,keys_handed:true,body_condition_ok:!damage,tyres_ok:true,lights_ok:true,brakes_ok:true,interior_clean:true,spare_wheel_and_tools:true}),stage==='pickup'?'Clean car, full documents seen':'',damage,renter,damage?'Agreed, will pay for touch-up':'Confirmed').lastInsertRowid);for(const label of ['front','back','left','right']){const name=`${label}-${stage}.svg`,svg=`<svg xmlns="http://www.w3.org/2000/svg" width="800" height="500"><defs><linearGradient id="g"><stop stop-color="#4338ca"/><stop offset="1" stop-color="#f59e0b"/></linearGradient></defs><rect width="800" height="500" fill="url(#g)"/><text x="40" y="240" fill="white" font-size="48">${label.toUpperCase()} - ${stage.toUpperCase()}</text><text x="40" y="300" fill="white" font-size="32">${car.name.replace(/[&<>]/g,'')}</text></svg>`;fs.writeFileSync(path.join(folder,name),svg);const url=`/uploads/handover/${completedId}/${name}`,sha=crypto.createHash('sha256').update(svg).digest('hex');db.prepare('INSERT INTO handover_photos(check_id,uploaded_by,label,url,sha256) VALUES(?,?,?,?,?)').run(checkId,primaryOwner,label,url,sha)}}
 db.prepare('INSERT INTO bookings(vehicle_id,renter_id,start_at,hours,total,status,rate_per_hour,list_price_per_hour,handover_state) VALUES(?,?,?,?,?,?,?,?,?)').run(suv.id,renterIds[1],new Date(Date.now()+3*86400000).toISOString(),3,suv.price*3,'pending',suv.price,suv.price,'none');
}

db.prepare("SELECT id FROM users WHERE role='owner'").all().forEach(({id})=>refreshTrust(db,id));
console.table(db.prepare("SELECT id,name,avg_reply_minutes FROM users WHERE role='owner' ORDER BY id").all().map(u=>{const t=computeOwnerTrust(db,u.id);return {owner:u.name,score:t.score,tier:t.tier,verified:t.verified,avg_reply_minutes:t.avg_reply_minutes}}));
console.log('Seed complete: demo renters, vehicles, historical bookings and trust scores.');
