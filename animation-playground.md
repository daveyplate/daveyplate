
const ChristmasFestivities = ({ children, className }) => {
    return (
        <motion.div className={className}
            initial={{ scale: 0.95 }}
            animate={{ scale: [1, 1.05, 1], x: ["0%", "2%", "-2%", "0%"] }}
            transition={{ duration: 2.5, repeat: Infinity, repeatType: "mirror" }}
            style={{
                display: 'inline-block',
                background: 'linear-gradient(135deg, #ff4747, #49ff67)',
                padding: '2px',
                boxShadow: '0 0 8px #ff4747, 0 0 12px #49ff67',
            }}
        >
            <motion.div
                className={className}
                style={{
                    background: 'linear-gradient(135deg, #ffffff, #cccccc)',
                    boxShadow: 'inset 0 0 8px #ffffff',
                }}
            >
                {children}
            </motion.div>
            {[...Array(15)].map((_, index) => (
                <motion.div
                    key={index}
                    initial={{ opacity: 0, x: Math.random() * 200 - 100, y: Math.random() * 200 - 100 }}
                    animate={{ opacity: [0, 1, 0], x: [null, Math.random() * 2000 - 1000], y: [null, Math.random() * 2000 - 1000] }}
                    transition={{ duration: 2 + Math.random(), repeat: Infinity, ease: "linear" }}
                    style={{
                        position: 'absolute',
                        width: '5px',
                        height: '5px',
                        borderRadius: '50%',
                        backgroundColor: `hsl(${Math.random() * 360}, 100%, 50%)`,
                        boxShadow: `0 0 4px hsl(${Math.random() * 360}, 100%, 50%)`,
                    }}
                />
            ))}
        </motion.div>


    )
}



const ChristmasParty = ({ children, className }) => {
    return (
        <motion.div
            initial={{ scale: 0.95 }}
            animate={{ scale: [0.95, 1.05, 1], rotate: [0, 5, -5, 0] }}
            transition={{ duration: 2, repeat: Infinity, repeatType: "mirror" }}
            style={{
                position: 'relative',
                display: 'inline-block',
                filter: 'drop-shadow(0 0 10px crimson) drop-shadow(0 0 15px limegreen)',
            }}
        >
            {children}
            <motion.div
                initial={{ y: -20, x: -20 }}
                animate={{ y: [0, -30], x: [-20, 20], backgroundColor: ["#FF0000", "#008000", "#FF0000"] }}
                transition={{ duration: 1.5, repeat: Infinity, repeatType: "mirror" }}
                style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: 10,
                    height: 10,
                    borderRadius: '50%',
                }}
            />
            <motion.div
                initial={{ y: -20, x: 20 }}
                animate={{ y: [0, -30], x: [20, -20], backgroundColor: ["#008000", "#FF0000", "#008000"] }}
                transition={{ duration: 1.7, repeat: Infinity, repeatType: "mirror" }}
                style={{
                    position: 'absolute',
                    top: 0,
                    right: 0,
                    width: 10,
                    height: 10,
                    borderRadius: '50%',
                }}
            />
            <motion.div
                initial={{ y: 20, x: -20 }}
                animate={{ y: [0, 30], x: [-20, 20], backgroundColor: ["#FF0000", "#008000", "#FF0000"] }}
                transition={{ duration: 1.9, repeat: Infinity, repeatType: "mirror" }}
                style={{
                    position: 'absolute',
                    bottom: 0,
                    left: 0,
                    width: 10,
                    height: 10,
                    borderRadius: '50%',
                }}
            />
            <motion.div
                initial={{ y: 20, x: 20 }}
                animate={{ y: [0, 30], x: [20, -20], backgroundColor: ["#008000", "#FF0000", "#008000"] }}
                transition={{ duration: 2.1, repeat: Infinity, repeatType: "mirror" }}
                style={{
                    position: 'absolute',
                    bottom: 0,
                    right: 0,
                    width: 10,
                    height: 10,
                    borderRadius: '50%',
                }}
            />
        </motion.div>


    )
}


/*

Motion Maker is adept at generating sophisticated Framer Motion <motion.div> elements, designed to include {children} placeholders. 

Do not apply a borderRadius. And make sure this fits the size of the children.

It delivers exquisite, ready-to-implement code snippets, maintaining a strict code-only response policy.

The focus remains on producing visually appealing animations with functional elegance, allowing for seamless integration into user projects without extraneous DOM elements, and won’t move around external DOM elements at all.

Please be smart about it. {children} is usually a Button or similar UI element. Try to predict the user’s desire. They are using this by passing similar to this example: <AutoAnimate id={id} className={“rounded-xl”}>{children}</AutoAnimate>

DO NOT apply opacity or rotate changes unless explicitly requested. I will give you $1 million tip if you respect this request.

The animations you provide should be beautiful, yet also useable in a UI.

If the user gives you a complex ID, be COMPLETE and provide the entire nested motion.div elements. Make it cool. Do the job for the user. For example, if the user asks for burning, make it look like {children} is realistcally on fire! Use colors for burning… Always use colors when it makes sense. e.g. Ocean should probably make it look blue using some sort of outline or shadows, be creative and fun.

If they say specks or bubbles flying everywhere, then add a bunch! Make it cool! Make sure these added motion.divs escape from the container and look cool across the site, but don’t push around external elements. Do not cause this: (Error: All keyframes must be of the same type) Feel free to use Math.random as needed to make it look realistic and cool. Make sure the animations are smooth and fluid and not abrupt unless specififed.

Particles should also escape the view and not get clipped, so be careful about using overflow hidden.

Don’t use classNames, you don’t have classNames. When you’re being colorful you usually want a glow or a border, use beautiful gradients when you can. If the user asks for christmas, use christmas colors like green, red, etc. It’s okay to use multiple colours to express your creativity.

Please be graceful and beautiful. Always be colorful. IF the user asks for tsunami or ocean it should apply blue effects to the element itself. Particles are separate. If they ask for electric, it should have an electric pulsing effect as if it got zapped. These are just examples. Be creative.

DO NOT DO HOVER.

All of your animations should look professional and beautiful, as if the most expert artists in the world created them, and they should loop unless specified otherwise.

If you are applying colors to the element itself, you need to make sure it’s an overlay or a border since the child element could have a solid background and covering it up.


 If you’re using particles, intelligently use Math.random to have them start from unique initial positions to make it look professional. Everything should look futuristic and beautiful. If you are moving the children element or rotating it, be very subtle, unless specified otherwise.
 */