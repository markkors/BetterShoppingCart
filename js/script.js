let stock = [
    /*{id:1,brand:"Toshiba",type:"Satellite",memory: "8GB",price:800},
    {id:2,brand:"Acer",type:"Aspire",memory: "16GB",price:1200},
    {id:3,brand:"Apple",type:"MacBook Pro",memory: "8GB",price:1800},
    {id:4,brand:"HP",type:"ENVI",memory: "8GB",price:2300},
    {id:5,brand:"Koffiemachine",type:"BOSCH",memory: "1GB",price:875}*/
];

let formatter = new Intl.NumberFormat('nl-NL', {
    style: 'currency',
    currency: 'EUR',
});


// updated code to get async data from json file

async function readJSON() {
    const response = await fetch('data.json');
    const data = await response.json();
    return data;
}

// lees cookie (als deze bestaat natuurlijk)
let cart = [];
cart = JSON.parse(leesCookie("shoppingcart"));
if(cart == null || cart == undefined || cart.length == 0) {
    cart = [];
}

// helper functie
// totaal van de winkelwagen
function sumcart() {
    let sum = 0;
    cart.forEach((o) => {
        sum+=parseFloat(o.number) * parseFloat(o.price);
    });
    return sum;
}

// start e.e.a. nadat content is geladen
document.addEventListener("DOMContentLoaded",function () {
    readJSON().then(function(data) {
        stock=data;
        document.getElementById("total").innerText = formatter.format(sumcart())
        // cart schrijven indien deze data bevat
        if(cart.length > 0) {
            readcart(cart);
        }

        // data uitlezen uit database
        stock.forEach(function(item) {
            readitems(item);
        });


        // lees de shoppingcart en maak aan in HTML
        function readcart(data) {
            data.forEach(function (item) {
                let c = document.getElementById("shoppingcart");
                if(c == null || c == undefined) {
                    c = document.createElement("div");
                    c.setAttribute("id","shoppingcart");
                    document.body.appendChild(c);
                }
                c.style.display = "flex";
                let r = document.createElement("DIV");
                r.setAttribute("class","row");
                c.appendChild(r);
                for (p in item) {
                    let ele = document.createElement("DIV");

                    if(p === "price") {
                        ele.innerHTML = formatter.format(item[p]); //`&euro; ${item[p]}`;
                    } else {
                        ele.innerText = item[p];
                    }

                    r.appendChild(ele);
                }
                let ele = document.createElement("DIV");
                let b = document.createElement("button");
                b.addEventListener("click",function () {
                    removefromcart(item,r);
                });
                b.innerText = "Delete";
                ele.appendChild(b);
                r.appendChild(ele);

                // voeg een + button toe
                ele = document.createElement("DIV");
                b = document.createElement("button");
                b.addEventListener("click",function () {
                    plus(item,r);
                });
                b.innerText = "+";
                ele.appendChild(b);
                r.appendChild(ele);


                // voeg een - button toe
                ele = document.createElement("DIV");
                b = document.createElement("button");
                b.addEventListener("click",function () {
                    minus(item,r);
                });
                b.innerText = "-";
                ele.appendChild(b);
                r.appendChild(ele);
            });

        }

        function plus(item,ele) {
            let obj = cart.find(o => o.id === item.id);
            if(obj != null) {
                obj.number++;
            }
            updatecart()
            maakCookie("shoppingcart",JSON.stringify(cart),7);
        }

        function minus(item,ele) {
            let obj = cart.find(o => o.id === item.id);
            if(obj != null) {
                obj.number--;
                if(obj.number <= 0) {
                    removefromcart(item,ele);
                }
            }
            updatecart()
            maakCookie("shoppingcart",JSON.stringify(cart),7);
        }


        // lees de database en maak HTML tabel
        function readitems(data) {
            let c = document.getElementById("container");
            let r = document.createElement("DIV");
            r.setAttribute("class","row");
            c.appendChild(r);

            for (p in data) {
                let ele = document.createElement("DIV");
                if(p === "price") {
                    ele.innerHTML = formatter.format(data[p]); // `&euro; ${data[p]}`;
                } else {
                    ele.innerText = data[p];
                }
                r.appendChild(ele);
            }

            let ele = document.createElement("DIV");
            let b = document.createElement("button");
            b.addEventListener("click",function () {
                addtocart(data);
            });
            b.innerText = "Order";
            ele.appendChild(b);
            r.appendChild(ele);
        }

        // voegt een item toe aan de shoppingcart
        function addtocart(item) {
            let item_exist_incart = false;
            let cart_item = null;
            for(let i = 0;i<cart.length;i++) {
                if(cart[i].id == item.id)  {
                    item_exist_incart = true;
                    cart_item = cart[i];
                    break;
                }
            }

            // item allready exist
            if(item_exist_incart) {
                cart_item.number +=1;
            } else {
                item.number = 1;
                cart.push(item);
                readcart(cart);
            };
            updatecart();
            maakCookie("shoppingcart",JSON.stringify(cart),7);
        }

        // verwijderd een item uit de shoppingcart
        function removefromcart(item,r) {
            r.remove();
            cart.splice(cart.indexOf(item),1);
            maakCookie("shoppingcart",JSON.stringify(cart),7);
            if(cart.length==0) {
                const myNode = document.getElementById("shoppingcart");
                myNode.style.display="none";
            }
            document.getElementById("total").innerText = formatter.format(sumcart())
        }

        // update de shoppingcart
        function updatecart() {
            // remove complete cart first
            const myNode = document.getElementById("shoppingcart");
            while (myNode.firstChild) {
                myNode.removeChild(myNode.lastChild);
            }
            readcart(cart);
            document.getElementById("total").innerText = formatter.format(sumcart())
        }

    }); // fetch JSON
});  //DOM Content