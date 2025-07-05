// Note: You need to add this endpoint to your Spring Boot OrderController

@PostMapping
public ResponseEntity<OrderDTO> createOrder(@RequestBody CreateOrderRequest request) {
    try {
        OrderDTO order = orderService.createOrder(request);
        return new ResponseEntity<>(order, HttpStatus.CREATED);
    } catch (Exception e) {
        return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
    }
}

// Also, you'll need to implement the createOrder method in your service layer
// The CreateOrderRequest DTO should match the interface in your TypeScript types

// CreateOrderRequest fields expected:
// - accountId: Integer
// - orderDate: String (LocalDate)
// - totalPrice: Double  
// - status: String
// - address: String
// - phone: String
// - notes: String (optional)
// - orderDetails: List<CreateOrderDetailRequest>

// CreateOrderDetailRequest fields expected:
// - orchidId: Integer
// - quantity: Integer
// - unitPrice: Double
