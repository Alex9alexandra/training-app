import selfsigned from "selfsigned";
import fs from "fs";


async function main() {
  const attrs = [{ name: "commonName", value: "10.247.178.195" }];
  const pems = await selfsigned.generate(attrs, { 
    keySize: 2048,
    extensions: [
      {
        name: 'subjectAltName',
        altNames: [
          { type: 7, ip: '10.247.178.195' }, 
          { type: 2, value: 'localhost' },
        ]
      }
    ]
  });
  fs.writeFileSync("cert.pem", pems.cert);
  fs.writeFileSync("key.pem", pems.private);

  console.log("cert.pem and key.pem generated!");
}

main();