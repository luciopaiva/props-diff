
function main(args) {
    if (args.length !== 2) {
        console.error("Must provide two files for comparison.");
        process.exit(1);
    }


}

main(process.argv.slice(2));
