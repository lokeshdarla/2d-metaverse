module smart_contracts::funding;

    /// Structure representing a funding program
    public struct Program has key, store {
        id: UID,                     // Unique ID for the program
        creator: address,            // Address of the program creator
        title: vector<u8>,           // Title of the program
        description: vector<u8>,     // Description of the program
        goal_amount: u64,            // Goal funding amount
        current_amount: u64,         // Current funded amount
    }

    /// Initializes a new funding program
    public fun create_program(
        title: vector<u8>,
        description: vector<u8>,
        goal_amount: u64,
        ctx: &mut TxContext
    ): Program {
        Program {
            id: object::new(ctx),
            creator: ctx.sender(),
            title,
            description,
            goal_amount,
            current_amount: 0,
        }
    }

    /// Allows a user to donate to a funding program
    public fun donate(
        program: &mut Program,
        amount: u64
    ) {
        assert!(amount > 0, 0x1); // Ensure the donation amount is valid
        program.current_amount = program.current_amount + amount;
    }

    /// Gets details of the program
    public fun get_details(program: &Program): (address, vector<u8>, vector<u8>, u64, u64) {
        (
            program.creator,
            program.title,
            program.description,
            program.goal_amount,
            program.current_amount
        )
    }
