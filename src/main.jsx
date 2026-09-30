import React, {useMemo, useState} from 'react';
import {createRoot} from 'react-dom/client';
import {
  Menu, X, CalendarDays, MapPin, Trophy, ShoppingBag, Phone,
  MessageCircle, CheckCircle2, Clock3, ShieldCheck, ChevronRight,
  ArrowRight, Users, IndianRupee, Send, Instagram, Star
} from 'lucide-react';
import './style.css';

const GROUNDS = [
  {id:'ak', name:'DY Patil AK Club Ground', area:'Salumbre, Pune', desc:'Cricket ground for practice, corporate and tournament matches.'},
  {id:'mcg', name:'MCG Ground', area:'Pune', desc:'Flexible ground booking for cricket events and team practice.'},
  {id:'atoz', name:'ATOZ Ground', area:'Pune', desc:'Cricket venue for practice and organised matches.'}
];

const SLOTS = [
  {id:'t1', type:'Tennis', time:'7:00 AM – 9:00 AM', price:7000},
  {id:'t2', type:'Tennis', time:'9:00 AM – 11:00 AM', price:7000},
  {id:'t3', type:'Tennis', time:'4:00 PM – 6:00 PM', price:7000},
  {id:'l1', type:'Leather', time:'7:00 AM – 10:00 AM', price:16000, includes:'Balls • Umpire • Trophies'},
  {id:'l2', type:'Leather', time:'11:00 AM – 2:00 PM', price:16000, includes:'Balls • Umpire • Trophies'},
  {id:'l3', type:'Leather', time:'3:00 PM – 6:00 PM', price:16000, includes:'Balls • Umpire • Trophies'}
];

const SERVICES = [
  ['Ground Booking','Tennis & leather cricket slots across our Pune grounds.','🏟️'],
  ['Tournament Management','Corporate cricket tournaments, fixtures, coordination and awards.','🏆'],
  ['Sports Event Services','Umpires, balls, trophies and match-day support.','🎯'],
  ['Sports Shop','Cricket equipment, teamwear and Blue Kaps merchandise. Coming soon.','🛒']
];

function money(n){return '₹'+Number(n).toLocaleString('en-IN');}
function today(){return new Date().toISOString().slice(0,10);}

function App(){
  const [page,setPage] = useState('home');
  const [mobileNav,setMobileNav] = useState(false);
  const [ground,setGround] = useState(GROUNDS[0].id);
  const [date,setDate] = useState(today());
  const [type,setType] = useState('Tennis');
  const [selected,setSelected] = useState(null);
  const [booking,setBooking] = useState({team:'',captain:'',mobile:'',matchType:'Practice'});
  const [toast,setToast] = useState('');
  const [admin,setAdmin] = useState(false);
  const [requests,setRequests] = useState([]);

  const currentGround = GROUNDS.find(g=>g.id===ground);
  const slots = useMemo(()=>SLOTS.filter(s=>s.type===type),[type]);

  const go = (p) => {setPage(p); setMobileNav(false); window.scrollTo({top:0,behavior:'smooth'});};

  function isBooked(slotId){
    const key = `${ground}_${date}_${slotId}`;
    return requests.some(r=>r.key===key && r.status==='approved');
  }

  function selectSlot(slot){
    if(isBooked(slot.id)) return;
    setSelected(slot);
    setToast('');
  }

  function submitBooking(e){
    e.preventDefault();
    if(!selected) return;
    if(!booking.team || !booking.captain || !/^[0-9]{10}$/.test(booking.mobile)){
      setToast('Please enter Team Name, Captain Name and a valid 10-digit mobile number.');
      return;
    }
    const key=`${ground}_${date}_${selected.id}`;
    if(isBooked(selected.id)){setToast('Sorry, this slot was just booked. Please select another slot.');return;}
    const req={id:Date.now(),key,ground,date,slot:selected.id,...booking,status:'pending'};
    setRequests(x=>[...x,req]);
    const msg = `Hello Blue Kaps Sports & Event,%0A%0ABooking request:%0ATeam: ${encodeURIComponent(booking.team)}%0ACaptain: ${encodeURIComponent(booking.captain)}%0AMobile: ${booking.mobile}%0AGround: ${encodeURIComponent(currentGround.name)}%0ADate: ${date}%0ASlot: ${encodeURIComponent(selected.time)}%0AMatch Type: ${booking.matchType}%0AAmount: ${selected.price}%0A%0APayment screenshot attached.`;
    window.open(`https://wa.me/919049468729?text=${msg}`,'_blank');
    setToast('Request saved. Please send your payment screenshot on WhatsApp. Your slot is confirmed only after DK approves the payment.');
    setSelected(null);
    setBooking({team:'',captain:'',mobile:'',matchType:'Practice'});
  }

  function approve(id){
    setRequests(rs=>rs.map(r=>r.id===id?{...r,status:'approved'}:r));
  }
  function reject(id){
    setRequests(rs=>rs.map(r=>r.id===id?{...r,status:'rejected'}:r));
  }

  const nav = [
    ['home','Home'],['booking','Ground Booking'],['tournaments','Tournaments'],['services','Services'],['shop','Sports Shop'],['contact','Contact']
  ];

  return <div className="site">
    <header className="topbar">
      <div className="container navrow">
        <button className="brand" onClick={()=>go('home')} aria-label="Blue Kaps home">
          <span className="brand-mark">BK</span>
          <span><b>BLUE KAPS</b><small>SPORTS & EVENT • PUNE</small></span>
        </button>
        <nav className={mobileNav?'nav open':'nav'}>
          {nav.map(([id,label])=><button key={id} className={page===id?'navactive':''} onClick={()=>go(id)}>{label}</button>)}
          <button className="navbook" onClick={()=>go('booking')}>BOOK A GROUND <ArrowRight size={15}/></button>
        </nav>
        <button className="mobile-menu" onClick={()=>setMobileNav(!mobileNav)}>{mobileNav?<X/>:<Menu/>}</button>
      </div>
    </header>

    {page==='home' && <Home go={go}/>}
    {page==='booking' && <Booking
      ground={ground} setGround={setGround} date={date} setDate={setDate}
      type={type} setType={setType} slots={slots} selectSlot={selectSlot}
      isBooked={isBooked} selected={selected} setSelected={setSelected}
      booking={booking} setBooking={setBooking} submitBooking={submitBooking}
      toast={toast} currentGround={currentGround}
    />}
    {page==='tournaments' && <Tournaments go={go}/>}
    {page==='services' && <Services go={go}/>}
    {page==='shop' && <Shop/>}
    {page==='contact' && <Contact/>}

    <footer>
      <div className="container footergrid">
        <div><div className="footerbrand">BLUE KAPS</div><p>Sports & Event • Pune</p><p>Ground booking, tournament management and sports services.</p></div>
        <div><h4>Quick Links</h4>{nav.slice(1,5).map(([id,label])=><button key={id} onClick={()=>go(id)}>{label}</button>)}</div>
        <div><h4>Contact</h4><a href="tel:+919049468729"><Phone size={15}/> 9049468729</a><a href="https://wa.me/919049468729" target="_blank"><MessageCircle size={15}/> WhatsApp</a><span><MapPin size={15}/> Pune, Maharashtra</span></div>
      </div>
      <div className="copyright">© {new Date().getFullYear()} Blue Kaps Sports & Event. All rights reserved.</div>
    </footer>

    <button className="whatsapp" onClick={()=>window.open('https://wa.me/919049468729','_blank')}><MessageCircle size={22}/><span>WhatsApp</span></button>

    {admin && <AdminPanel requests={requests} approve={approve} reject={reject} close={()=>setAdmin(false)}/>}
    <button className="adminlink" onClick={()=>setAdmin(true)}>DK Admin Demo</button>
  </div>
}

function Home({go}){
 return <main>
   <section className="hero">
    <div className="container hero-inner">
      <div className="hero-copy">
        <div className="eyebrow">PUNE • CRICKET • EVENTS</div>
        <h1>Play. Compete.<br/><span>Make it happen.</span></h1>
        <p>Cricket ground booking and complete sports event management by Blue Kaps Sports & Event.</p>
        <div className="hero-actions"><button className="primary" onClick={()=>go('booking')}>Book a Ground <ArrowRight size={18}/></button><button className="ghost" onClick={()=>go('tournaments')}>Explore Tournaments</button></div>
        <div className="trust"><span><CheckCircle2/> Easy booking</span><span><ShieldCheck/> Payment verified</span><span><Users/> Team focused</span></div>
      </div>
      <div className="hero-card">
        <div className="hero-card-top"><span>GROUND BOOKING</span><CalendarDays/></div>
        <h3>Your next match starts here.</h3>
        <div className="mini-slot"><span>🎾 Tennis</span><b>From ₹7,000</b></div>
        <div className="mini-slot"><span>🏏 Leather</span><b>₹16,000</b></div>
        <small>Leather package includes balls, umpire & trophies.</small>
        <button onClick={()=>go('booking')}>Check availability <ChevronRight size={16}/></button>
      </div>
    </div>
   </section>
   <section className="section">
    <div className="container"><div className="sectionhead"><div><div className="eyebrow">WHAT WE DO</div><h2>Everything around your game.</h2></div><button className="textbutton" onClick={()=>go('services')}>View services <ArrowRight size={16}/></button></div>
    <div className="servicegrid">{SERVICES.map(([t,d,i])=><div className="servicecard" key={t}><div className="serviceicon">{i}</div><h3>{t}</h3><p>{d}</p><button onClick={()=>go(t==='Ground Booking'?'booking':t==='Tournament Management'?'tournaments':t==='Sports Shop'?'shop':'services')}>Explore <ArrowRight size={15}/></button></div>)}</div></div>
   </section>
   <section className="darksection"><div className="container split"><div><div className="eyebrow">THREE VENUES • ONE PLACE</div><h2>Book your ground without the Excel headache.</h2><p>See available slots, submit your team details, pay through your preferred UPI and send the payment screenshot on WhatsApp. DK verifies and approves the booking.</p><button className="primary light" onClick={()=>go('booking')}>View Live Booking Flow <ArrowRight size={17}/></button></div><div className="venue-list">{GROUNDS.map(g=><div className="venue" key={g.id}><MapPin/><div><b>{g.name}</b><span>{g.area}</span></div><ChevronRight/></div>)}</div></div></section>
   <section className="section"><div className="container"><div className="sectionhead"><div><div className="eyebrow">COMING SOON</div><h2>Blue Kaps Sports Shop</h2><p>Cricket gear, teamwear and Blue Kaps merchandise — coming soon.</p></div><button className="primary" onClick={()=>go('shop')}>Visit Shop <ShoppingBag size={17}/></button></div></div></section>
 </main>
}

function Booking({ground,setGround,date,setDate,type,setType,slots,selectSlot,isBooked,selected,setSelected,booking,setBooking,submitBooking,toast,currentGround}){
 return <main className="bookingpage"><div className="container">
   <div className="pageintro"><div className="eyebrow">GROUND BOOKING</div><h1>Choose your ground & slot.</h1><p>Available slots are shown in green. A slot becomes booked only after DK verifies payment.</p></div>
   <div className="bookinglayout">
    <div>
      <div className="panel filters">
       <label>Ground<select value={ground} onChange={e=>setGround(e.target.value)}>{GROUNDS.map(g=><option value={g.id} key={g.id}>{g.name}</option>)}</select></label>
       <label>Date<input type="date" min={today()} value={date} onChange={e=>setDate(e.target.value)}/></label>
       <div><label>Match Type</label><div className="seg"><button className={type==='Tennis'?'on':''} onClick={()=>setType('Tennis')}>Tennis</button><button className={type==='Leather'?'on':''} onClick={()=>setType('Leather')}>Leather</button></div></div>
      </div>
      <div className="groundnote"><MapPin/><div><b>{currentGround.name}</b><span>{currentGround.area} • {currentGround.desc}</span></div></div>
      <div className="slotgrid">{slots.map(s=>{const b=isBooked(s.id);return <button disabled={b} onClick={()=>selectSlot(s)} className={'bookslot '+(b?'isbooked':'')} key={s.id}><div className="slotstatus"><span className="statusdot"></span>{b?'BOOKED':'AVAILABLE'}</div><b>{s.time}</b><strong>{money(s.price)}</strong>{s.includes&&<small>{s.includes}</small>}</button>})}</div>
    </div>
    <div className="panel how">
      <div className="eyebrow">HOW IT WORKS</div><h2>Simple & secure.</h2>
      {[
        ['1','Select','Choose ground, date and slot.'],
        ['2','Pay','Pay the displayed amount via GPay/UPI.'],
        ['3','WhatsApp','Send payment screenshot to 9049468729.'],
        ['4','Approve','DK verifies payment and confirms the booking.']
      ].map(x=><div className="step" key={x[0]}><span>{x[0]}</span><div><b>{x[1]}</b><p>{x[2]}</p></div></div>)}
    </div>
   </div>
   {selected && <div className="panel bookingform"><div className="formhead"><div><div className="eyebrow">BOOKING REQUEST</div><h2>{currentGround.name}</h2><p>{date} • {selected.time} • {money(selected.price)}</p></div><button onClick={()=>setSelected(null)}><X/></button></div>
     <form onSubmit={submitBooking}>
       <div className="formgrid"><label>Team Name<input required value={booking.team} onChange={e=>setBooking({...booking,team:e.target.value})} placeholder="e.g. Blue Kaps XI"/></label><label>Captain Name<input required value={booking.captain} onChange={e=>setBooking({...booking,captain:e.target.value})} placeholder="Captain full name"/></label><label>Mobile Number<input required maxLength="10" inputMode="numeric" value={booking.mobile} onChange={e=>setBooking({...booking,mobile:e.target.value.replace(/\D/g,'')})} placeholder="10-digit mobile"/></label><label>Match Type<select value={booking.matchType} onChange={e=>setBooking({...booking,matchType:e.target.value})}><option>Practice</option><option>Tournament</option></select></label></div>
       <div className="paymentbox"><div><IndianRupee/><b>Pay {money(selected.price)}</b></div><p>Make payment to Blue Kaps Sports & Event using your GPay/UPI. Then send the payment screenshot on WhatsApp.</p><small>For leather slots: balls + umpire + trophies included.</small></div>
       <button className="primary full" type="submit"><Send size={17}/> Submit & Send on WhatsApp</button>
     </form>
   </div>}
   {toast&&<div className="toast"><CheckCircle2/>{toast}</div>}
 </div></main>
}

function Tournaments({go}){return <main><div className="container pageintro"><div className="eyebrow">TOURNAMENTS</div><h1>Corporate cricket, organised properly.</h1><p>From fixtures and ground coordination to umpires, balls, trophies and match-day operations.</p></div><section className="section"><div className="container tournamentgrid"><div className="tourcard featured"><span className="pill">BLUE KAPS</span><h2>Corporate Cricket Tournaments</h2><p>Weekend leagues, T20 formats, tournament coordination and complete event support for corporate teams in Pune.</p><ul><li>Team registration & coordination</li><li>Fixtures and match scheduling</li><li>Ground and umpire coordination</li><li>Balls, trophies and awards</li><li>Match-day support</li></ul><button className="primary" onClick={()=>go('contact')}>Discuss Your Tournament <ArrowRight/></button></div><div className="tourfacts"><div><Trophy/><b>Competitive formats</b><span>League • Knockouts • Finals</span></div><div><CalendarDays/><b>Weekend scheduling</b><span>Plan your season in advance</span></div><div><Users/><b>Corporate teams</b><span>Team-first tournament management</span></div></div></div></section></main>}

function Services({go}){return <main><div className="container pageintro"><div className="eyebrow">SPORTS SERVICES</div><h1>More than a ground.</h1><p>Blue Kaps brings the venue, people and match-day requirements together.</p></div><section className="section"><div className="container servicegrid big">{SERVICES.map(([t,d,i])=><div className="servicecard" key={t}><div className="serviceicon">{i}</div><h3>{t}</h3><p>{d}</p><button onClick={()=>go(t==='Ground Booking'?'booking':t==='Sports Shop'?'shop':'contact')}>Get Started <ArrowRight/></button></div>)}</div></section></main>}

function Shop(){return <main><div className="shophero"><div className="container"><div className="eyebrow">COMING SOON</div><h1>Blue Kaps Sports Shop</h1><p>Cricket equipment, teamwear and Blue Kaps merchandise are coming soon.</p><div className="coming"><ShoppingBag size={38}/><b>Shop is under preparation.</b><span>We’ll bring bats, balls, gloves, pads, shoes, jerseys, caps and team merchandise.</span><button className="primary" onClick={()=>window.open('https://wa.me/919049468729?text=Hello%20Blue%20Kaps%2C%20I%20want%20updates%20about%20the%20Sports%20Shop.','_blank')}>Get Shop Updates <MessageCircle/></button></div></div></div></main>}

function Contact(){return <main><div className="container pageintro"><div className="eyebrow">CONTACT</div><h1>Let's organise your next match.</h1><p>For ground booking, tournaments, event services or sports shop enquiries.</p></div><section className="section"><div className="container contactgrid"><div className="contactcard"><Phone/><h3>Call / WhatsApp</h3><a href="tel:+919049468729">9049468729</a><p>Send your requirement directly to Blue Kaps Sports & Event.</p><button className="primary" onClick={()=>window.open('https://wa.me/919049468729','_blank')}>Chat on WhatsApp <MessageCircle/></button></div><div className="contactcard"><MapPin/><h3>Serving Pune</h3><p>DY Patil AK Club Ground, MCG Ground, ATOZ Ground and more venues as we expand.</p><div className="venue-list compact">{GROUNDS.map(g=><div className="venue" key={g.id}><MapPin/><div><b>{g.name}</b><span>{g.area}</span></div></div>)}</div></div></div></section></main>}

function AdminPanel({requests,approve,reject,close}){
 return <div className="adminoverlay"><div className="adminmodal"><div className="formhead"><div><div className="eyebrow">DK ADMIN</div><h2>Booking approvals</h2></div><button onClick={close}><X/></button></div>{requests.length===0?<p>No booking requests yet. Customer requests will appear here.</p>:requests.map(r=>{const g=GROUNDS.find(x=>x.id===r.ground);const s=SLOTS.find(x=>x.id===r.slot);return <div className="adminreq" key={r.id}><div><b>{r.team}</b><span>{r.captain} • {r.mobile}</span><span>{g.name} • {r.date} • {s.time}</span><strong>{money(s.price)} • {r.matchType}</strong></div><div>{r.status==='pending'?<><button className="approve" onClick={()=>approve(r.id)}>APPROVE</button><button className="reject" onClick={()=>reject(r.id)}>REJECT</button></>:<span className={'status '+r.status}>{r.status.toUpperCase()}</span>}</div></div>})}</div></div>
}

createRoot(document.getElementById('root')).render(<App/>);
