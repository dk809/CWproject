
let app = new Vue({
    el: '#app',
    data: {
      lessons: [],
      cart: [],
      showCart: false,
      checkoutName: '',
      checkoutPhone: '',
      checkoutEmail: '',
      checkoutAddress: '',
      sortAttribute: 'subject',
      sortOrder: 'asc', 
      searchQuery: '',
    },

    computed: {

        filteredLessons() {
          const query = this.searchQuery.toLowerCase(); 
          this.lessons = this.lessons.filter(lesson => {
            const subject = lesson.subject?.toLowerCase() || ''; 
            const location = lesson.location?.toLowerCase() || '';
            const price = lesson.price?.toString() || '';
            const spaces = lesson.spaces?.toString() || '';
    
            return (
              subject.includes(query) || // Search by subject
              location.includes(query) || // Search by location
              price.includes(query) || // Search by price
              spaces.includes(query) // Search by available spaces
            );
          });
        },
    
        sortedLessons() {
          // copy lessons array to preserve default order
          let sortedArray = [...this.lessons];
    
    
          // Sort based on the selected attribute and order
          if (sortedArray.length > 0) {
            sortedArray.sort((a, b) => {
              let valueA = a[this.sortAttribute];
              let valueB = b[this.sortAttribute];
              if (typeof valueA === 'string' && typeof valueB === 'string') {
                valueA = valueA.toLowerCase();
                valueB = valueB.toLowerCase();
              }
    
              if (this.sortOrder === 'asc') {
                return valueA > valueB ? 1 : valueA < valueB ? -1 : 0;
              } else {
                return valueA < valueB ? 1 : valueA > valueB ? -1 : 0;
              }
            });
          }
    
    
          this.lessons = sortedArray
          return sortedArray;
        },
    
    
        // displayedLessons() {
        //   this.lessons.value = this.sortedLessons;  // using sortedLessons for final lesson display
        //   return this.lessons
        // },
        isCheckoutEnabled() {
          const nameValid = /^[a-zA-Z]+$/.test(this.checkoutName);
          const phoneValid = /^[0-9]+$/.test(this.checkoutPhone);
          return nameValid && phoneValid;
        },
      },
      methods: {
    
        debugFilteredLessons() {
          const filtered = this.filteredLessons;
          console.log('Manually Triggered Filtered Lessons:', filtered);
        },
        toggleSortOrder() {
          this.sortOrder = this.sortOrder === 'asc' ? 'desc' : 'asc';
        },
        addToCart(lesson) {
          // check if lesson has enough space and return if not
          if (lesson.spaces > 0) {
            // check if the lesson is already in the cart
            const cartItem = this.cart.find(item => item.subject === lesson.subject);
            if (cartItem) {
              cartItem.quantity += 1; // increase quantity
            } else {
              this.cart.push({ id: lesson.id, subject: lesson.subject, quantity: 1, price: lesson.price });
            }
            lesson.spaces -= 1; // decrease available spaces in lessons
          }
        },
        toggleCart() {
          this.showCart = !this.showCart;
        },
        removeFromCart(cartItem) {
          const lesson = this.lessons.find(l => l.subject === cartItem.subject);
          if (cartItem.quantity > 1) {
            cartItem.quantity -= 1; // reduce quantity in the cart
          } else {
            this.cart = this.cart.filter(item => item.subject !== cartItem.subject); // Remove item from cart if quantity is 1
          }
          lesson.spaces += 1; // increase available spaces in lessons
        },
        validateName() {
          this.checkoutName = this.checkoutName.replace(/[^a-zA-Z]/g, '');
        },
        validatePhone() {
          this.checkoutPhone = this.checkoutPhone.replace(/[^0-9]/g, '');
        },
        validateEmail() {
          this.checkoutEmail = this.checkoutEmail.replace(/[^a-zA-Z0-9@._-]/g, '');
        },
        checkout() {
    
          const items = this.cart.map(cartItem => {
            return {
              quantity: cartItem.quantity, id: cartItem.id
            }
          });
          const payload = JSON.stringify({
            items: items,
            name: this.checkoutName,
            phone: this.checkoutPhone
          })
          console.log(payload)
          const myHeaders = new Headers();
          myHeaders.append("Content-Type", "application/json");
    
          // const raw = JSON.stringify({
          //   "Name": "Donu"
          // });
    
          const requestOptions = {
            method: "POST",
            headers: myHeaders,
            body: payload,
            // redirect: "follow"
          };
    
          fetch("http://localhost:3000/order/", requestOptions)
            .then((response) => response.json())
            .then((result) => console.log(result))
            .catch((error) => console.error(error));
          // fetch(`/order123/`, { method: 'POST', body: payload })
          //   .then((res) => res.json())
          //   .then((data) => data)
    
          this.cart = [];
          this.checkoutName = '';
          this.checkoutPhone = '';
          this.showCart = false;
          // alert(`Order for ${this.checkoutName} has been submitted.`);
        },
        searchLessons() {
          fetch(`/search?search_term=${this.searchQuery}`, { method: 'GET' })
            .then((res) => res.json())
            .then((data) => { this.lessons = data })
        }
      },
    
      created() {
        fetch('http://localhost:3000/collections/lessons')
          .then((res) => res.json())
          .then((d) => {
            console.log('Success', d)
            this.lessons = d
          })
          .catch((error) => {
            console.error('error from backend', error)
          })
      }
    });